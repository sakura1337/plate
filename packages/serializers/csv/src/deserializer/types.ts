export interface DeserializeCsvPlugin {
  /**
   * Percentage in decimal form, from 0 to a very large number, 0 for no errors allowed,
   * Percentage based on number of errors compared to number of rows
   * @default 0.25
   */
  errorTolerance?: number;
}
