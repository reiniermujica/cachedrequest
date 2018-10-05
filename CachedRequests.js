const hash = require('object-hash');

class CachedRequests {
  constructor() {
    this.cachedResults = {};
  }

  addRequests = (...args) => {
    args.forEach((requestFunction) => {
      const { name } = requestFunction;

      if (!this[name]) {
        this[name] = this.requestHandler.bind(this, requestFunction);
        this.initializeRequestCache(name);
      }
    });
  };

  requestHandler = (...args) => {
    const requestName = args[0].name;

    const requestParams = args.slice(1);
    const cachedRequestData = this.getRequestCachedData(requestName, requestParams);

    if (typeof cachedRequestData !== 'undefined') {
      return Promise.resolve(cachedRequestData);
    }

    const requestFunc = args[0];

    return new Promise((resolve, reject) => {
      requestFunc(...requestParams)
        .then((data) => {
          this.storeRequestData(requestName, requestParams, 'success', data);
          resolve(data);
        })
        .catch((error) => {
          this.storeRequestData(requestName, requestParams, 'errors', error);
          reject(error);
        });
    });
  };

  initializeRequestCache = (requestName) => {
    this.cachedResults[requestName] = {
      success: new Map(),
      errors: new Map()
    };
  };

  getRequestCachedData = (requestName, requestParams) => {
    const { cachedResults } = this;

    const requestSuccess = cachedResults[requestName].success;
    const requestErrors = cachedResults[requestName].errors;
    const paramsHash = this.getHash(requestParams);

    if (requestSuccess.has(paramsHash)) {
      const results = requestSuccess.get(paramsHash);
      return results;
    }

    if (requestErrors.has(paramsHash)) {
      const results = requestErrors.get(paramsHash);
      return results;
    }

    return undefined;
  };

  storeRequestData = (requestName, requestParams, requestStatus, requestData) => {
    const { cachedResults } = this;
    const paramsHash = this.getHash(requestParams);

    cachedResults[requestName][requestStatus].set(paramsHash, requestData);
  };

  getHash = (obj) => {
    return hash(obj, CachedRequests.hashOptions);
  };
}

CachedRequests.hashOptions = {
  unorderedArrays: true,
  unorderedObjects: true,
  unorderedSets: true,
  respectType: false
};

export default CachedRequests;
