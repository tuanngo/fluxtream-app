define([], function() {
	var APP, PREFS, TOOLS, TAG_MANAGER, VIEWS, SOURCES;
	var BodyTrack = {};

	APP = {
			isInitialized : false,

			init : function(callback) {
                VIEWS.getAvailableList(function() {
                    callback();
                });

                // Initialize the TAG_MANAGER
                TAG_MANAGER.init();
			}
	};

	PREFS = {
			__map : {},

			reset : function() {
				PREFS.__map = {};
			},

			get : function(keysStr, defaultVal) {
				if (typeof keysStr === 'string' && keysStr.length > 0) {
					var keys = keysStr.split(".");
					var o = PREFS.__map;
					for (var i=0;i<keys.length;i++) {
						var key = keys[i];
						if (typeof o[key] !== 'undefined') {
							o = o[key];
							if (i == (keys.length - 1)) {
								return o;
							}
						}
					}
				}
				return defaultVal;
			},

			set : function(keysStr, value) {
				if (typeof keysStr === 'string' && keysStr.length > 0 && typeof value !== 'undefined') {
					var keys = keysStr.split(".");
					var o = PREFS.__map;

					for (var i=0;i<keys.length;i++) {
						var key = keys[i];

						if (typeof o[key] !== 'object') {
							o[key] = {};
						}
						if (i == (keys.length - 1)) {
							o[key] = value;
							return true;
						} else {
							o = o[key];
						}
					}
				}
				return false;
			}
	};

	TOOLS = {
			resizeTimer : null,
			resizeCallbackList : [],
			resizeElements : [],

			// Add callback to list of resize callbacks
			onWindowResizeListener : function(callback) {
				TOOLS.resizeCallbackList.push(callback);
			},

			// Add element to resize on window resize
			onWindowResizeResizeElementHeight : function(el) {
				TOOLS.resizeElements.push(el);
			},

			// Resize handler used by window.onResize
			resizeHandler : function() {
				var i, l;

				l = TOOLS.resizeCallbackList.length;
				for (i = 0; i < l; i++) {
					TOOLS.resizeCallbackList[i]();
				}

				l = TOOLS.resizeElements.length;
				for (i = 0; i < l; i++) {
					TOOLS.resizeElementHeight($(TOOLS.resizeElements[i]));
				}
			},
			// http://stackoverflow.com/questions/33080/setting-the-height-of-a-div-dynamically
			resizeElementHeight : function(element) {
				if (element != null && element.length > 0) {
					var height = 0;
					var body = window.document.body;
					if (window.innerHeight) {
						height = window.innerHeight;
					} else if (body.parentElement.clientHeight) {
						height = body.parentElement.clientHeight;
					} else if (body && body.clientHeight) {
						height = body.clientHeight;
					}
					element.height((height - element.offset().top - 85) + "px");
				}
			},

			/**
			 * Tries to parse the given intStr as an int.  Returns the parsed int or, if
			 * parsing fails, returns the given defaultVal
			 */
			parseInt : function(intStr, defaultVal) {
				var val = parseInt(intStr);
				if (isNaN(val)) {
					return defaultVal;
				}
				return val;
			},

			/**
			 * Clones the given object by performing a deep copy.  This is apparently a very
			 * efficient way to clone, according to one of the jQuery gurus.  See here for
			 * more info:
			 *
			 * http://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-clone-a-javascript-object
			 */
			clone : function(obj) {
				return jQuery.extend(true, {}, obj);
			},

			loadJson : function(url, urlParams, callbacks) {
				if (typeof url !== 'undefined') {

					if (!urlParams) {
						urlParams = {};
					}
					if (typeof callbacks === 'undefined') {
						callbacks = {};
					}
					var successCallback = callbacks['success'];
					var errorCallback = callbacks['error'];
					var completeCallback = callbacks['complete'];

					$.ajax({
						cache    : false,
						type     : "GET",
						url      : url,
						data     : urlParams,
						success  : function(data, textStatus, jqXHR) {
							try {
								if (typeof successCallback === 'function') {
									successCallback(typeof data === 'string' ? JSON.parse(data) : data);
								}
							}
							catch (ex) {
								console.log("loadJson.success: JSON parse error, or failure in the successCallback: " + ex);
							}
						},
						error    : function(jqXHR, textStatus, errorThrown) {
							try {
								if (typeof errorCallback === 'function') {
									errorCallback(textStatus, errorThrown);
								}
							}
							catch (ex) {
								console.log("loadJson.error: Failure in the errorCallback: " + ex);
							}
						},
						complete : function(jqXHR, textStatus) {
							try {
								if (typeof completeCallback === 'function') {
									completeCallback(textStatus);
								}
							}
							catch (ex) {
								console.log("loadJson.complete: Failure in the completeCallback: " + ex);
							}
						}
					});
				}
			}
	};

	TAG_MANAGER = {
			tags : [], // array of tags--refresh this with TAG_MANAGER.refreshTagCache()

			refreshTagCache : function(successCallback) {

				var caseInsensitiveSort = function(tag1, tag2) {
					var a = tag1.toLowerCase();
					var b = tag2.toLowerCase();
					if (a < b) {
						return -1;
					}
					if (a > b) {
						return 1;
					}
					return 0;
				};

				TOOLS.loadJson("/bodytrack/users/" + App.getUID() + "/tags",
						{},
						{
							success : function(data, textStatus, jqXHR) {
								try {
									var jsonData = typeof data === 'string' ? JSON.parse(data) : data;
									if (jQuery.isArray(jsonData)) {
										TAG_MANAGER.tags = jsonData.sort(caseInsensitiveSort);
									}

									if (typeof successCallback === 'function') {
										successCallback();
									}
								}
								catch (ex) {
									console.log("TAG_MANAGER.refreshTagCache.success: Failed to parse tag array:" + ex);
								}
							},
							error   : function(jqXHR, textStatus, errorThrown) {
								console.log("TAG_MANAGER.refreshTagCache.error: Failed to fetch tags:" + errorThrown);
							}
						}
				);
			},

			// Returns the cached tags in the format required by the tag editor plugin
			getCachedTagsForTagEditor : function(tagsToExclude) {
				if (!jQuery.isArray(tagsToExclude)) {
					tagsToExclude = [];
				}

				// dump the items in tagsToExclude into a hash map
				var excludedTags = {};
				jQuery.each(tagsToExclude,
						function(index,val) {
					excludedTags[val] = 1;
				});

				var cachedTagsData = new Array();
				if (TAG_MANAGER.tags.length > 0) {
					jQuery.each(TAG_MANAGER.tags,
							function(index, val) {
						// only include tags which aren't in the exclusion list
						if (typeof excludedTags[val] === 'undefined') {
							cachedTagsData[cachedTagsData.length] = {
									"id"    : "_tag_" + index,
									"label" : val,
									"value" : val
							};
						}
					});
				}
				return cachedTagsData.sort();
			},

			init : function() {
				TAG_MANAGER.refreshTagCache();
			}
	};

	VIEWS = {
			data : "",
			availableList : [],
			saveCallbackList : [],

			getAvailableList : function(callback) {
				$.ajax({
					cache   : false,
					type    : "GET",
					url     : "/bodytrack/users/" + App.getUID() + "/views",
					success : function(data, textStatus, jqXHR) {
						var parsed = JSON.parse(data);
						VIEWS.availableList = parsed.views;
						if (typeof callback === "function") {
							callback(parsed.views);
						}
					},
					error   : function(jqXHR, textStatus, errorThrown) {
						VIEWS.availableList = [];
					}
				});
			},

			// Set view data
			load : function(id, callback) {
				$.ajax({
					cache   : false,
					type    : "GET",
					url     : "/bodytrack/users/" + App.getUID() + "/views/get",
					data    : { "id" : id },
					success : function(data, textStatus, jqXHR) {
						VIEWS.data = JSON.parse(data);
						if (typeof callback === "function") {
							callback(VIEWS.data);
						}
					}
				});
			},

			// Update view data
			// callback returns same response as VIEWS.getAvailableList()
			save : function(name, callback) {
				// Update view data before saving with new name
				VIEWS.data["name"] = name;

				$.ajax({
					cache   : false,
					type    : "POST",
					url     : "/bodytrack/users/" + App.getUID() + "/views/set",
					data    : {
						"name" : name,
						"data" : JSON.stringify(VIEWS.data)
					},

					// Successful save returns data with updated list of views
					// and id of newly saved view
					success : function(data, textStatus, jqXHR) {
						var i, l;
						var parsed = JSON.parse(data);
						VIEWS.availableList = parsed.views;

						l = VIEWS.saveCallbackList.length;
						for (i = 0; i < l; i++) {
							VIEWS.saveCallbackList[i]();
						}
						if (typeof callback === "function") {
							callback(parsed.views, parsed.saved_view_id);
						}
					}
				});
			},

			// Add callback to list of onSave callbacks
			onSaveListener : function(callback) {
				VIEWS.saveCallbackList.push(callback);
			}
	}; // VIEWS

	SOURCES = {
			availableList  : [],
			configuredList : [],
			discoveryList  : [],

			getAvailableList : function(callback) {
				$.ajax({
					cache   : false,
					type    : "GET",
					url     : "/bodytrack/users/" + App.getUID() + "/sources/list",
					success : function(data, textStatus, jqXHR) {
						var parsed = JSON.parse(data);
						SOURCES.availableList = parsed.sources;

						if (typeof callback === "function") {
							callback(parsed.sources);
						}
					},
					error   : function(jqXHR, textStatus, errorThrown) {
						SOURCES.availableList = []
						console.log("Error fetching available list");
						console.log("Error fetching available list");
					}
				});
			},
			getConfiguredList : function(callback) {
				$.ajax({
					cache   : false,
					type    : "GET",
					url     : "/bodytrack/users/" + App.getUID() + "/sources",
					success : function(data, textStatus, jqXHR) {
						var parsed = JSON.parse(data);
						SOURCES.configuredList = parsed.sources;

						if (typeof callback === "function") {
							callback(parsed.sources);
						}
					},
					error   : function(jqXHR, textStatus, errorThrown) {
						SOURCES.configuredList = []
						console.log("Error fetching configured list");
					}
				});
			},
			getDiscoveryList : function(callback) {
				$.ajax({
					cache   : false,
					type    : "GET",
					url     : "/bodytrack/users/" + App.getUID() + "/sources/discovery",
					success : function(data, textStatus, jqXHR) {
						var parsed = JSON.parse(data);
						SOURCES.discoveryList = parsed.sources;

						if (typeof callback === "function") {
							callback(parsed.sources);
						}
					},
					error   : function(jqXHR, textStatus, errorThrown) {
						SOURCES.discoveryList = []
						console.log("Error fetching discovery list");
					}
				});
			},
			getDefaultGraphSpecs : function(device_name, callback) {
				$.ajax({
					cache   : false,
					type    : "GET",
					url     : "/bodytrack/users/" + App.getUID() + "/sources/default_graph_specs",
					data    : { "name" : device_name },
					success : function(data, textStatus, jqXHR) {
						if (typeof callback === "function") {
							callback(JSON.parse(data).info);
						}
					},
					error   : function(jqXHR, textStatus, errorThrown) {
						console.log("Error fetching default graph specs");
					}
				});
			}
	}; // SOURCES

    window.channelDatasource = function(userId, deviceName, channelName) {
        var urlPrefix = "/bodytrack/tiles/" + userId + "/" + deviceName + "."
                            + channelName + "/";
        return __createDatasource(urlPrefix);
    }

    // If allTags is true, we require all tags to be present.
    // Otherwise, any tag in tags is OK (the default)
    window.photoDatasource = function(userId, deviceName, tags, allTags, nsfw) {
        var urlPrefix = "/bodytrack/photos/" + userId + "/";
        var urlParams = {};
        if (deviceName != null && deviceName.toLowerCase() != "all") {
            urlParams["dev_nickname"] = deviceName;
        }
        if (tags != null && tags.length > 0) {
            if (!!allTags) {
                urlParams["all_tags"] = tags.join(",");
            } else {
                urlParams["any_tags"] = tags.join(",");
            }

            // TODO: This line is only for compatibility with the server
            // until the server supports any_tags and all_tags.  This
            // can be safely removed, with no impact on correctness,
            // when that server support is added
            urlParams["tags_filter"] = tags.join(",");
        }
        if (!!nsfw) {
            urlParams["nsfw"] = "1";
        }
        return __createDatasource(urlPrefix, urlParams);
    }

    /// A helper to create a data fetcher for the specified URL prefix
    ///
    /// @param urlPrefix
    ///  The shared part of the URLs to fetch from.  Each fetch will come
    ///  from the URL (urlPrefix + level + "." + offset + ".json)
    /// @param urlParams
    ///  Optional parameter - if present, must be a dictionary.  This
    ///  is joined together and URL encoded to form the URL parameters
    ///  on each request
    /// @return
    ///  A function matching the requestData specification from the
    ///  grapher API specification, taking a level, an offset, a success
    ///  callback, and a failure callback, making a request to a URL
    ///  built from the URL prefix, level, and offset, and calling the
    ///  success continuation on success or the failure continuation on
    ///  failure
    function __createDatasource(urlPrefix, urlParams) {
        if (!urlParams) {
            urlParams = {};
        }
        return function(level, offset, success_callback, failure_callback) {
            var onerr = function(jqXHR, textStatus, errorThrown) {
                try {
                    if (failure_callback) {
                        failure_callback(errorThrown);
                    }
                }
                catch (ex) {
                    console.log("channelDatasource.onErr(): FAILURE! ex:" + ex);
                }
            };
            $.ajax({
                       url     : urlPrefix + level + "." + offset + ".json",
                       data    : urlParams,
                       success : function(data, textStatus, jqXHR) {
                           try {
                               if (success_callback) {
                                   // we must always send the JSON as a String...
                                   success_callback(typeof data === 'string' ? data : JSON.stringify(data));
                               }
                           }
                           catch (ex) {
                               onerr(jqXHR, "JSON parse error", ex);
                           }
                       },
                       failure : onerr
                   });
        };
    };

	BodyTrack.APP 		  = APP;
	BodyTrack.PREFS 	  = PREFS;
	BodyTrack.TOOLS 	  = TOOLS;
	BodyTrack.TAG_MANAGER = TAG_MANAGER;
	BodyTrack.VIEWS 	  = VIEWS;
	BodyTrack.SOURCES 	  = SOURCES;

	// for debugging
	window.BodyTrack = BodyTrack;

	return BodyTrack;

});
