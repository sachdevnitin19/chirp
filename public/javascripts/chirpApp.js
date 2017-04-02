var app = angular.module('chirpApp', ['ngRoute', 'ngResource']).run(function($rootScope,$location,$http) {
	$rootScope.authenticated = false;
	$rootScope.current_user = '';
	$rootScope.signout = function(){
    	$http.get('auth/signout');
    	$rootScope.authenticated = false;
    	$rootScope.current_user = '';
    	$location.path('/');
	};

	$rootScope.search=function(user){
		
		$http.get('/api/finduser/'+user).then(function(data)
			{
				
				if(data.data.success)
				{
					$rootScope.searcheduser=data.data.user;
					$rootScope.postbyuser=data.data.tweets;
					$rootScope.j=0;
					$rootScope.postbyuser.forEach(function(i){
						$rootScope.j++;
					})
					
					$location.path('/stats');	
				}
				else if(!data.data.success)
				{
					
					$location.path('/');
					window.alert(data.data.message+", Enter correct username.");
				}
			});
	}
});

app.config(function($routeProvider){
	$routeProvider
		//the timeline display
		.when('/', {
			templateUrl: 'main.html',
			controller: 'mainController'
		})
		//the login display
		.when('/login', {
			templateUrl: 'login.html',
			controller: 'authController'
		})
		//the signup display
		.when('/register', {
			templateUrl: 'register.html',
			controller: 'authController'
		})
		.when('/stats',{
			templateUrl:'stats.html'
		});
});

app.factory('postService', function($resource){
	return $resource('/api/posts/:id');
});

app.controller('mainController', function(postService, $scope, $rootScope){
	$scope.posts = postService.query();
	$scope.newPost = {created_by: '', text: '', created_at: ''};
	
	$scope.post = function() {
	  $scope.newPost.created_by = $rootScope.current_user;
	  $scope.newPost.created_at = Date.now();
	  postService.save($scope.newPost, function(){
	    $scope.posts = postService.query();
	    $scope.newPost = {created_by: '', text: '', created_at: ''};
	  });
	};
});

app.controller('authController', function($scope, $http, $rootScope, $location){
  $scope.user = {username: '', password: ''};
  $scope.error_message = '';

  $scope.login = function(){
    $http.post('/auth/login', $scope.user).success(function(data){
      if(data.state == 'success'){
        $rootScope.authenticated = true;
        $rootScope.current_user = data.user.username;
        $location.path('/');
      }
      else{
        $scope.error_message = data.message;
      }
    });
  };

  $scope.register = function(){
    $http.post('/auth/signup', $scope.user).success(function(data){
      if(data.state == 'success'){
        $rootScope.authenticated = true;
        $rootScope.current_user = data.user.username;
        $location.path('/');
      }
      else{
        $scope.error_message = data.message;
      }
    });
  };
});