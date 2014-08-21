(function() {
  var app = angular.module('BookNotifier', ['ui.bootstrap']);

  app.controller('MainCtrl', function($scope, $http) {
    $scope.dbFile = "";
    $scope.db = {};
    $scope.series = {};

    $scope.PrettyJSON = function(obj)
    {
        return angular.toJson(obj, true);
    }

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

    $scope.alreadyHasBook = function(title, books)
    {
        for (var i in books)
        {
            if (books[i].title == title)
                return true;
        }
        return false;
    }

    $scope.lookupGoogleData = function(seriesTitle)
    {
        var apiBase = "https://www.googleapis.com/books/v1/volumes?q=";
        var apiFull = apiBase

        if (!$scope.series[seriesTitle].multipleAuthors)
        {
            var authorPieces = $scope.series[seriesTitle].author.split(" ");
            for (var str in authorPieces) {
                apiFull += "inauthor:" + authorPieces[str] + "+"
            }
        }

        var seriesPieces = seriesTitle.split(" ");
        apiFull += "bibliogroup:'";
        for (var str in seriesPieces)
        {
            apiFull += seriesPieces[str] + "+"
        }

        apiFull += "'&orderBy=newest&langRestrict=en";

        $http.get(apiFull).success(function (data) {
            $scope.series[seriesTitle].data = data;
            $scope.series[seriesTitle].retrievedData = true;
            console.log(seriesTitle + " found " + data.totalItems + " items.");

            for (var i = 0; i < data.items.length; i++) {
                var title = data.items[i].volumeInfo.title;
                if (!$scope.alreadyHasBook(title, $scope.series[seriesTitle].books) && !$scope.alreadyHasBook(title, $scope.series[seriesTitle].newBooks)) {
                    var newBook = {};
                    newBook.title = title;
                    newBook.publishedDate = data.items[i].volumeInfo.publishedDate;
                    newBook.googleLink = data.items[i].volumeInfo.canonicalVolumeLink;
                    newBook.googleID = data.items[i].id;

                    $scope.series[seriesTitle].newBooks.push(newBook);
                    $scope.series[seriesTitle].hasNewBooks = true;
                }
            }
        });

    }

    $scope.processFile = function()
    {
        $scope.db = new SQL.Database($scope.dbFile);
        var calibreData = {};

        var query = "select books.title, series.name as Series, authors.name as Author, books.series_index as SeriesIndex " +
            "from books_series_link " +
            "join books on books_series_link.book=books.id " +
            "join series on series.id=books_series_link.series " +
            "join books_authors_link on books_authors_link.book = books_series_link.book " +
            "join authors on authors.id=books_authors_link.author " +
            "order by series,  seriesindex";

        var results = ($scope.db.exec(query))[0].values;
        var series="";

        for (var i=0;i<results.length;i++)
        {
            if (series != results[i][1]) //Start of a new series
            {
                series = results[i][1];
                calibreData[series] = {multipleAuthors:false, author: results[i][2]};
                calibreData[series].books = [];
                calibreData[series].newBooks = [];
                calibreData[series].retrievedData = false;
            }
            if (calibreData[series].author != results[i][2] )
            {
                calibreData[series].multipleAuthors = true;
            }
            calibreData[series].books.push({"title": results[i][0], "index": results[i][3]})
        }
        $scope.series = calibreData;

//        for (var seriesTitle in $scope.series)
//        {
//            setTimeout($scope.lookupGoogleData(seriesTitle),500);
//        }
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
