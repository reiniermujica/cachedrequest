import CachedRequests from './CachedRequests';

const CacheHandler = function() {
  const singletonInstance = new CachedRequests();

  const makeCache = function(...args) {
    singletonInstance.addRequests(...args);
  };

  return {
    makeCache: makeCache,
    cache: singletonInstance
  };
};

export default CacheHandler();
