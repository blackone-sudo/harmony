/**
 * Encapsulates an operation to be performed against a backend.  Currently the
 * class is largely getters and setters.  The eventual intent is to allow us
 * to maintain multiple versions of the operation JSON schema, which this class
 * or its children would know how to serialize
 *
 * @class DataOperation
 */
class DataOperation {
  /**
   * Creates an instance of DataOperation.
   *
   * @param {object} [model=null] The initial model, useful when receiving serialized operations
   * @memberof DataOperation
   */
  constructor(model = null) {
    this.model = model || {
      sources: [],
      format: {},
      subset: {},
    };
  }

  /**
   * Returns the service data sources, a list of objects containing a collection ID with the
   * variables and granules to operate on.
   *
   * @returns {Array<DataSource>} The service data sources
   * @memberof DataOperation
   */
  get sources() {
    return this.model.sources;
  }

  /**
   * Sets the service data sources, a list of objects containing a collection ID with the variables
   * and granules to operate on
   *
   * @param {Array<DataSource>} sources The service data sources
   * @returns {void}
   * @memberof DataOperation
   */
  set sources(sources) {
    this.model.sources = sources;
  }

  /**
   * Adds a new service data source to the list of those to operate on
   *
   * @param {string} collection The CMR ID of the collection being operated on
   * @param {Array<object>} variables An array of objects containing variable id and name
   * @param {Array<object>} granules An array of objects containing granule id, name, and url
   * @returns {void}
   * @memberof DataOperation
   */
  addSource(collection, variables, granules) {
    this.model.sources.push({ collection, variables, granules });
  }

  /**
   * Returns the CRS into which the data should be transformed
   *
   * @returns {string} The CRS into which the data should be transformed
   * @memberof DataOperation
   */
  get crs() {
    return this.model.format.crs;
  }

  /**
   * Sets the CRS into which the data should be transformed
   *
   * @param {string} crs The new CRS value
   * @returns {void}
   * @memberof DataOperation
   */
  set crs(crs) {
    this.model.format.crs = crs;
  }

  /**
   * Returns true if the service output should be transparent where there is no data (if possible)
   *
   * @returns {bool} true if the service output should be transparent where there is no data
   * @memberof DataOperation
   */
  get isTransparent() {
    return this.model.format.isTransparent;
  }

  /**
   * Sets the flag indicating whether the service output should be transparent where there is no
   * data, if possible.  True if so, false otherwise.
   *
   * @param {bool} isTransparent true if the output should be transparent where there is no data
   * @returns {void}
   * @memberof DataOperation
   */
  set isTransparent(isTransparent) {
    this.model.format.isTransparent = isTransparent;
  }

  /**
   * Returns the mime type which the service should provide as its output format, e.g. "image/tiff"
   *
   * @returns {string} the mime type which the service should provide as its output format
   * @memberof DataOperation
   */
  get outputFormat() {
    return this.model.format.mime;
  }

  /**
   * Sets the mime type which the service should provide as its output format, e.g. "image/tiff"
   *
   * @param {string} mime the mime type to use as an output format
   * @returns {void}
   * @memberof DataOperation
   */
  set outputFormat(mime) {
    this.model.format.mime = mime;
  }

  /**
   * Sets the requested dots-per-inch resolution for image output.
   *
   * @param {number} dpi The DPI resolution for image output
   * @returns {void}
   * @memberof DataOperation
   */
  set outputDpi(dpi) {
    this.model.format.dpi = dpi;
  }

  /**
   * Sets the (currently unused / undefined) styles to be used when returning imagery.
   * This will eventually be string identifiers for colormaps, should that be supported.
   *
   * @param {Array<string>} styles An array of valid styles
   * @returns {void}
   * @memberof DataOperation
   */
  set styles(styles) {
    this.model.format.styles = styles;
  }

  /**
   * Sets the color value to be used where there is no data, in services where images are
   * returned.  This only applies when `isTransparent` is false.  Currently unused by services.
   *
   * @param {string} color The hexadecimal color for image areas where there is no data
   * @returns {void}
   * @memberof DataOperation
   */
  set noDataColor(color) {
    this.model.format.noDataColor = color;
  }

  /**
   * Gets the bounding rectangle to be used for spatial subsetting, an array of 4 coordinates:
   *   [ East, South, West, North ]
   *
   * @returns {Array<number>} The subsetting bounding rectangle, [ East, South, West, North ]
   * @memberof DataOperation
   */
  get boundingRectangle() {
    return this.model.subset.bbox;
  }

  /**
   * Sets the bounding rectangle to be used for spatial subsetting, an array of 4 coordinates:
   *   [ East, South, West, North ]
   *
   * @param {Array<number>} bbox The subsetting bounding rectangle, [ East, South, West, North ]
   * @returns {void}
   * @memberof DataOperation
   */
  set boundingRectangle(bbox) {
    this.model.subset.bbox = bbox;
  }

  /**
   * Returns the temporal range to be acted upon by services, [ start, end ], where each time
   * is expressed in ISO 8601 format without milliseconds
   *
   * @returns {Array<string>} The [ start, end ] temporal range
   * @memberof DataOperation
   */
  get temporal() {
    const { temporal } = this.model;
    if (!temporal) return null;
    return [temporal.start, temporal.end];
  }

  /**
   * Sets the temporal range to be acted upon by services, [ start, end ], where each time
   * is expressed in ISO 8601 format without milliseconds
   *
   * @param {Array<string>} The [ start, end ] temporal range
   * @returns {void}
   * @memberof DataOperation
   */
  set temporal([startTime, endTime]) {
    this.model.temporal = {
      start: startTime,
      end: endTime,
    };
  }

  /**
   * Returns the requested width of the output file in pixels
   *
   * @returns {number} the requested width of the output file in pixels
   * @memberof DataOperation
   */
  get outputWidth() {
    return this.model.format.width;
  }

  /**
   * Sets the requested width of the output file in pixels
   *
   * @param {number} width the requested width of the output file in pixels
   * @returns {void}
   * @memberof DataOperation
   */
  set outputWidth(width) {
    this.model.format.width = width;
  }

  /**
   * Returns the requested height of the output file in pixels
   *
   * @returns {number} the requested height of the output file in pixels
   * @memberof DataOperation
   */
  get outputHeight() {
    return this.model.format.width;
  }

  /**
   * Sets the requested height of the output file in pixels
   *
   * @param {number} height the requested height of the output file in pixels
   * @returns {void}
   * @memberof DataOperation
   */
  set outputHeight(height) {
    this.model.format.height = height;
  }

  /**
   * Gets the URL to which data services should call back when they have completed
   *
   * @returns {string} The callback URL data services should send results to
   * @memberof DataOperation
   */
  get callback() {
    return this.model.callback;
  }

  /**
   * Sets the URL to which data services should call back when they have completed
   *
   * @param {string} value The callback URL data services should send results to
   * @returns {void}
   * @memberof DataOperation
   */
  set callback(value) {
    this.model.callback = value;
  }

  /**
   * Returns a JSON string representation of the data operation serialized according
   * to the provided JSON schema version ID (default: highest available)
   *
   * @param {number} [version=0] The version to serialize
   * @returns {string} The serialized data operation in the requested version
   * @memberof DataOperation
   */
  serialize(version = 0) {
    return JSON.stringify(Object.assign(this.model, { version }));
  }
}

module.exports = DataOperation;