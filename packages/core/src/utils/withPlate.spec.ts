import { createEditor } from 'slate';
import { createHeadingPlugin } from '../../../elements/heading/src/createHeadingPlugin';
import { createParagraphPlugin } from '../../../elements/paragraph/src/createParagraphPlugin';
import { KEY_INLINE_VOID } from '../plugins/createInlineVoidPlugin';
import { PlatePlugin } from '../types/plugins/PlatePlugin/PlatePlugin';
import { getPlugin } from './getPlugin';
import { withPlate } from './withPlate';

describe('withPlate', () => {
  describe('when default plugins', () => {
    it('should be', () => {
      const editor = withPlate(createEditor(), { id: '1' });

      const keys = [KEY_INLINE_VOID, 'event-editor', 'react', 'history'];

      expect(editor.id).toBe('1');
      expect(editor.history).toBeDefined();
      expect(editor.key).toBeDefined();
      expect(editor.plugins.map((plugin) => plugin.key)).toEqual(keys);
      expect(editor.plugins.map((plugin) => plugin.type)).toEqual(keys);
      expect(Object.keys(editor.pluginsByKey)).toEqual(keys);
    });
  });

  describe('when same plugin with different keys', () => {
    it('should be', () => {
      const pluginP: PlatePlugin = createParagraphPlugin();
      const pluginA: PlatePlugin = createParagraphPlugin({ key: 'a' });
      const pluginB: PlatePlugin = createHeadingPlugin(
        { options: { levels: 2 } },
        {
          h1: {
            key: 'hh1',
          },
        }
      );

      const editor = withPlate(createEditor(), {
        id: '1',
        plugins: [pluginP, pluginA, pluginB],
      });

      const keys = [
        'inline-void',
        'event-editor',
        'p',
        'a',
        'heading',
        'hh1',
        'h2',
      ];

      expect(Object.keys(editor.pluginsByKey)).toEqual(keys);
    });
  });

  describe('when it has recursive then', () => {
    it('should deep merge', () => {
      const pluginInput: PlatePlugin = {
        key: 'a',
        type: 'a',
        inject: {
          props: {
            nodeKey: 'a',
          },
        },
        then: (editor, { type }) => ({
          type: `${type}b`,
          inject: {
            props: {
              nodeKey: `${type}b`,
            },
          },
          then: (e, { type: _type }) => ({
            type: `${_type}c`,
            inject: {
              props: {
                nodeKey: `${_type}c`,
              },
            },
          }),
        }),
      };

      const plugins = [pluginInput];

      const editor = withPlate(createEditor(), { id: '1', plugins });

      const { type, inject } = getPlugin(editor, 'a');

      expect({ type, inject }).toEqual({
        type: 'abc',
        inject: {
          props: {
            nodeKey: 'abc',
          },
        },
      });
    });
  });

  describe('when then with nested plugins', () => {
    it('should deep merge the plugins', () => {
      const pluginAA: PlatePlugin = {
        key: 'aa',
        type: 'aa',
      };

      const pluginAB1: PlatePlugin = {
        key: 'ab',
        type: 'ab1',
      };
      const pluginAB2: PlatePlugin = {
        key: 'ab',
        type: 'ab2',
      };

      const pluginAC: PlatePlugin = {
        key: 'ac',
        type: 'ac',
      };
      const pluginAD: PlatePlugin = {
        key: 'ad',
        type: 'ad',
      };

      const pluginA: PlatePlugin = {
        key: 'a',
        plugins: [pluginAA, pluginAB1],
        then: () => ({
          plugins: [pluginAB2, pluginAC],
          then: () => ({
            plugins: [pluginAD],
          }),
        }),
      };

      const editor = withPlate(createEditor(), { id: '1', plugins: [pluginA] });

      const outputPluginAA = getPlugin(editor, 'aa');
      const outputPluginAB = getPlugin(editor, 'ab');
      const outputPluginAC = getPlugin(editor, 'ac');
      const outputPluginAD = getPlugin(editor, 'ad');

      expect([
        {
          key: outputPluginAA.key,
          type: outputPluginAA.type,
        },
        {
          key: outputPluginAB.key,
          type: outputPluginAB.type,
        },
        {
          key: outputPluginAC.key,
          type: outputPluginAC.type,
        },
        {
          key: outputPluginAD.key,
          type: outputPluginAD.type,
        },
      ]).toEqual([
        { key: pluginAA.key, type: pluginAA.type },
        { key: pluginAB2.key, type: pluginAB2.type },
        { key: pluginAC.key, type: pluginAC.type },
        { key: pluginAD.key, type: pluginAD.type },
      ]);
    });
  });
});