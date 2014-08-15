(function() {
  var app = angular.module('BookNotifier', ['ui.bootstrap']);

  app.controller('MainCtrl', function($scope) {
    $scope.dbFile = "";
    $scope.db = {};
    $scope.series = [];

    $scope.selectFile = function($event)
    {
        var f = $event.target.files[0];
        var r = new FileReader();
        r.onload = function() {
            var Uints = new Uint8Array(r.result);
            db = new SQL.Database(Uints);
        }
        r.readAsArrayBuffer(f);
    };

    $scope.processFile = function()
    {
        $scope.db = new SQL.Database($scope.dbFile);
        $scope.series = ($scope.db.exec("SELECT id,name FROM series;"))[0].values;
//        $scope.series = $scope.db.exec("SELECT `name`, `sql` FROM `sqlite_master` WHERE type='table';")
    };

  })
  .directive("fileread", [function () {
  //Code borrowed from Endy Tjahjono (http://stackoverflow.com/questions/17063000/ng-model-for-input-type-file)
        return {
            scope: {
                fileread: "="
            },
            link: function (scope, element, attributes) {
                element.bind("change", function (changeEvent) {
                    var reader = new FileReader();
                    reader.onload = function (loadEvent) {
                        scope.$apply(function () {
                            scope.fileread = new Uint8Array(loadEvent.target.result);
                        });
                    }
                    reader.readAsArrayBuffer(changeEvent.target.files[0]);
                });
            }
        }
  }]);
})();
