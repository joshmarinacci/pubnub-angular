// Generated by CoffeeScript 1.4.0
(function() {
  'use strict';

  angular.module('pubnub.angular.service', []).factory('PubNub', [
    '$rootScope', '$q', '$timeout', function($rootScope, $q, $timeout) {
      var c, k, _i, _len, _makeDataSyncOperation, _ref, _syncCallback;
      c = {
        'VERSION': '1.2.0-beta.1',
        '_instance': null,
        '_channels': [],
        '_presence': {},
        'jsapi': {}
      };
      _ref = ['map', 'each'];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        k = _ref[_i];
        if ((typeof PUBNUB !== "undefined" && PUBNUB !== null ? PUBNUB[k] : void 0) instanceof Function) {
          (function(kk) {
            return c[kk] = function() {
              var _ref1;
              return (_ref1 = c['_instance']) != null ? _ref1[kk].apply(c['_instance'], arguments) : void 0;
            };
          })(k);
        }
      }
      for (k in PUBNUB) {
        if ((typeof PUBNUB !== "undefined" && PUBNUB !== null ? PUBNUB[k] : void 0) instanceof Function) {
          (function(kk) {
            return c['jsapi'][kk] = function() {
              var _ref1;
              return (_ref1 = c['_instance']) != null ? _ref1[kk].apply(c['_instance'], arguments) : void 0;
            };
          })(k);
        }
      }
      c.initialized = function() {
        return !!c['_instance'];
      };
      c.init = function() {
        c['_instance'] = PUBNUB.init.apply(PUBNUB, arguments);
        c['_channels'] = [];
        c['_presence'] = {};
        c['_presData'] = {};
        return c['_instance'];
      };
      c.destroy = function() {
        c['_instance'] = null;
        c['_channels'] = null;
        c['_presence'] = null;
        return c['_presData'] = null;
      };
      c._ngFireMessages = function(realChannel) {
        return function(messages, t1, t2) {
          return c.each(messages[0], function(message) {
            return $rootScope.$broadcast("pn-message:" + realChannel, {
              message: message,
              channel: realChannel
            });
          });
        };
      };
      c._ngInstallHandlers = function(args) {
        var oldmessage, oldpresence;
        oldmessage = args.message;
        args.message = function() {
          if (args.channel) {
            $rootScope.$broadcast(c.ngMsgEv(args.channel), {
              message: arguments[0],
              env: arguments[1],
              channel: args.channel
            });
          }
          if (args.channel_group) {
            $rootScope.$broadcast(c.ngMsgEv(args.channel_group), {
              message: arguments[0],
              env: arguments[1],
              channel_group: args.channel_group
            });
          }
          if (oldmessage) {
            return oldmessage(arguments);
          }
        };
        oldpresence = args.presence;
        args.presence = function() {
          var channel, cpos, event, _base, _base1;
          event = arguments[0];
          if (args.channel_group) {
            channel = args.channel_group;
          }
          if (event.uuids) {
            c.each(event.uuids, function(uuid) {
              var state, _base, _base1;
              state = uuid.state ? uuid.state : null;
              uuid = uuid.uuid ? uuid.uuid : uuid;
              (_base = c['_presence'])[channel] || (_base[channel] = []);
              if (c['_presence'][channel].indexOf(uuid) < 0) {
                c['_presence'][channel].push(uuid);
              }
              (_base1 = c['_presData'])[channel] || (_base1[channel] = {});
              if (state) {
                return c['_presData'][channel][uuid] = state;
              }
            });
          } else {
            if (event.uuid && event.action) {
              (_base = c['_presence'])[channel] || (_base[channel] = []);
              (_base1 = c['_presData'])[channel] || (_base1[channel] = {});
              if (event.action === 'leave') {
                cpos = c['_presence'][channel].indexOf(event.uuid);
                if (cpos !== -1) {
                  c['_presence'][channel].splice(cpos, 1);
                }
                delete c['_presData'][channel][event.uuid];
              } else {
                if (c['_presence'][channel].indexOf(event.uuid) < 0) {
                  c['_presence'][channel].push(event.uuid);
                }
                if (event.data) {
                  c['_presData'][channel][event.uuid] = event.data;
                }
              }
            }
          }
          if (args.channel) {
            $rootScope.$broadcast(c.ngPrsEv(channel), {
              event: event,
              message: arguments[1],
              channel: channel
            });
          }
          if (args.channel_group) {
            $rootScope.$broadcast(c.ngPrsEv(channel), {
              event: event,
              message: arguments[1],
              channel_group: args.channel_group
            });
          }
          if (oldpresence) {
            return oldpresence(arguments);
          }
        };
        return args;
      };
      c.ngListChannels = function() {
        return c['_channels'].slice(0);
      };
      c.ngListPresence = function(channel) {
        var _ref1;
        return (_ref1 = c['_presence'][channel]) != null ? _ref1.slice(0) : void 0;
      };
      c.ngPresenceData = function(channel) {
        return c['_presData'][channel] || {};
      };
      c.ngSubscribe = function(args) {
        var _base, _base1, _name, _name1;
        if (args.channel) {
          if (c['_channels'].indexOf(args.channel) < 0) {
            c['_channels'].push(args.channel);
          }
          (_base = c['_presence'])[_name = args.channel] || (_base[_name] = []);
          args = c._ngInstallHandlers(args);
          c.jsapi.subscribe(args);
        }
        if (args.channel_group) {
          if (c['_channels'].indexOf(args.channel_group) < 0) {
            c['_channels'].push(args.channel_group);
          }
          (_base1 = c['_presence'])[_name1 = args.channel_group] || (_base1[_name1] = []);
          args = c._ngInstallHandlers(args);
          delete args['channel'];
          return c.jsapi.subscribe(args);
        }
      };
      c.ngUnsubscribe = function(args) {
        var cpos;
        cpos = c['_channels'].indexOf(args.channel);
        if (cpos !== -1) {
          c['_channels'].splice(cpos, 1);
        }
        c['_presence'][args.channel] = null;
        delete $rootScope.$$listeners[c.ngMsgEv(args.channel)];
        delete $rootScope.$$listeners[c.ngPrsEv(args.channel)];
        return c.jsapi.unsubscribe(args);
      };
      c.ngPublish = function() {
        return c['_instance']['publish'].apply(c['_instance'], arguments);
      };
      c.ngHistory = function(args) {
        args.callback = c._ngFireMessages(args.channel);
        return c.jsapi.history(args);
      };
      c.ngHistoryQ = function(args) {
        var deferred, oldcallback;
        deferred = $q.defer();
        oldcallback = args.callback;
        args.callback = function(x) {
          deferred.resolve(x);
          $rootScope.$apply();
          if (oldcallback) {
            return oldcallback(x);
          }
        };
        args.error = function(x) {
          return deferred.reject(x);
        };
        c['jsapi']['history'].apply(c['_instance'], [args]);
        return deferred.promise;
      };
      c.ngHereNow = function(args) {
        args = c._ngInstallHandlers(args);
        args.state = true;
        args.callback = args.presence;
        delete args.presence;
        delete args.message;
        return c.jsapi.here_now(args);
      };
      c.ngChannelGroupAddChannel = function(args) {
        return c.jsapi.channel_groups_add_channel({
          channel_group: args.channel_group,
          channel: args.channel
        });
      };
      c.ngChannelGroupRemoveChannel = function(args) {
        return c.jsapi.channel_group_remove_channel({
          channel_group: args.channel_group,
          channel: args.channel
        });
      };
      c.ngWhereNow = function(args) {
        return c.jsapi.where_now(args);
      };
      c.ngState = function(args) {
        return c.jsapi.state(args);
      };
      c.ngMsgEv = function(channel) {
        return "pn-message:" + channel;
      };
      c.ngPrsEv = function(channel) {
        return "pn-presence:" + channel;
      };
      c.ngCgEv = function(channel_group) {
        return "pn-channelgroup:" + channel_group;
      };
      c.ngAuth = function() {
        return c['_instance']['auth'].apply(c['_instance'], arguments);
      };
      c.ngAudit = function() {
        return c['_instance']['audit'].apply(c['_instance'], arguments);
      };
      c.ngGrant = function() {
        return c['_instance']['grant'].apply(c['_instance'], arguments);
      };
      c.datasync_BETA = {};
      _makeDataSyncOperation = function(op) {
        return function(args) {
          var deferred, oldcallback;
          if (!(args && args['object_id'])) {
            return;
          }
          deferred = $q.defer();
          oldcallback = args.callback;
          args.callback = function(x) {
            deferred.resolve(x);
            $rootScope.$apply();
            if (oldcallback) {
              return oldcallback(x);
            }
          };
          args.error = function(x) {
            return deferred.reject(x);
          };
          c['jsapi'][op].apply(c['_instance'], [args]);
          return deferred.promise;
        };
      };
      c.datasync_BETA.ngGet = _makeDataSyncOperation('get');
      c.datasync_BETA.ngSet = _makeDataSyncOperation('set');
      c.datasync_BETA.ngMerge = _makeDataSyncOperation('merge');
      c.datasync_BETA.ngRemove = _makeDataSyncOperation('remove');
      _syncCallback = function(name, object_id, path) {
        return function(r) {
          $rootScope.$broadcast(c.datasync_BETA.ngObjPathRecEv(object_id, path), {
            action: name,
            object_id: object_id,
            path: path,
            payload: r
          });
          return $rootScope.$apply();
        };
      };
      c.datasync_BETA.ngSync = function(object_id) {
        var result;
        if (!object_id) {
          return;
        }
        result = c['jsapi']['sync'].apply(c['_instance'], [object_id]);
        ['ready', 'change', 'update', 'remove', 'set', 'error'].forEach(function(x) {
          return result.on[x](_syncCallback(x, object_id, null));
        });
        ['connect', 'disconnect', 'reconnect'].forEach(function(x) {
          return result.on.network[x](_syncCallback(x, object_id, null));
        });
        return result;
      };
      c.datasync_BETA.ngObjPathEv = function(object_id, path) {
        return 'pn-datasync-obj:' + c.datasync_BETA.ngObjPathChan(object_id, path);
      };
      c.datasync_BETA.ngObjPathRecEv = function(object_id, path) {
        return 'pn-datasync-obj-rec:' + c.datasync_BETA.ngObjPathRecChan(object_id, path);
      };
      c.datasync_BETA.ngObjDsEv = function(object_id) {
        return 'pn-datasync-obj-ds:' + c.datasync_BETA.ngObjDsChan(object_id);
      };
      c.datasync_BETA.ngWatch = function(args) {
        var datastore, object_ds, object_ds_rec, object_id, oldcallback, path;
        if (!(args && args['object_id'])) {
          return;
        }
        object_id = args['object_id'];
        path = args['path'];
        datastore = {
          chan: c.datasync_BETA.ngObjDsChan(object_id),
          ev: c.datasync_BETA.ngObjDsEv(object_id)
        };
        object_ds = {
          chan: c.datasync_BETA.ngObjPathChan(object_id, path),
          ev: c.datasync_BETA.ngObjPathEv(object_id, path)
        };
        object_ds_rec = {
          chan: c.datasync_BETA.ngObjPathRecChan(object_id, path),
          ev: c.datasync_BETA.ngObjPathRecEv(object_id, path)
        };
        oldcallback = args.callback;
        return [object_ds, object_ds_rec, datastore].forEach(function(cfg) {
          return (function(chan, ev) {
            args.channel = chan;
            args.callback = function(o) {
              var payload;
              payload = {
                event: ev,
                channel: chan,
                object_id: object_id,
                path: path,
                payload: o
              };
              $rootScope.$broadcast(ev, payload);
              if (oldcallback) {
                return oldcallback(payload);
              }
            };
            return c['jsapi']['subscribe'].apply(c['_instance'], [args]);
          })(cfg.chan, cfg.ev);
        });
      };
      c.datasync_BETA.ngObjPathChan = function(object_id, path) {
        return 'pn_ds_' + object_id + (path ? '.' + path : '');
      };
      c.datasync_BETA.ngObjPathRecChan = function(object_id, path) {
        return c.datasync_BETA.ngObjPathChan(object_id, path) + '.*';
      };
      c.datasync_BETA.ngObjDsChan = function(object_id) {
        return 'pn_dstr_' + object_id;
      };
      return c;
    }
  ]);

}).call(this);
