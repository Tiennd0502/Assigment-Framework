let myApp = angular.module('myApp', ['ngRoute']);

myApp.config(($routeProvider) => {
  $routeProvider.when('/index', {
    templateUrl: './layouts/index.html?' + Math.random(),
    controller: 'SubjectCtrl'
  }).when('/introduce', {
    templateUrl: './layouts/introduce.html?' + Math.random()
  }).when('/contact', {
    templateUrl: '/layouts/contact.html?' + Math.random()
  }).when('/feedback', {
    templateUrl: '/layouts/feedback.html?' + Math.random()
  }).when('/answer', {
    templateUrl: '/layouts/answer.html?' + Math.random()
  }).when('/subject', {
    templateUrl: '/layouts/subject.html?' + Math.random(),
    controller: 'SubjectCtrl'
  }).when('/quiz/:id/:name/:logo', {
    templateUrl: '/layouts/quiz.html?' + Math.random(),
    controller: 'QuizCtrl'
  }).when('/login', {
    templateUrl: '/layouts/login.html?' + Math.random(),
    controller: 'LoginCtrl'
  }).when('/regis', {
    templateUrl: '/layouts/regis.html?' + Math.random(),
    controller: 'RegisCtrl'
  }).when('/forgotPass', {
    templateUrl: '/layouts/forgot_pass.html?' + Math.random(),
    controller: 'ForgotPassCtrl'
  }).when('/logout', {
    templateUrl: '/layouts/logout.html?' + Math.random(),
    controller: 'LogoutCtrl'
  }).when('/error', {
    templateUrl: '/layouts/error.html?' + Math.random(),
  }).otherwise({
    redirectTo: '/index'
  });
});

myApp.run(($rootScope) => {
  $rootScope.$on('$routeChangeStart', () => {
    $rootScope.loading = true;
  });
  $rootScope.$on('$routeChangeSucces', () => {
    $rootScope.loading = false;
  });
  $rootScope.$on('$routeChangeError', () => {
    $rootScope.loading = false;
    alert('Load trang không thành công!');
  });
});
myApp.controller('MasterCtrl', function($scope, $rootScope, $http) {
    $scope.list_subject = [];
    $scope.length = 0;
    $http.get('../db/Subjects.js').then((response) => {
      $scope.list_subject = response.data;
    }, (error) => {
      console.log("k load được data");
    });
    $scope.currentPage = 0;
    $scope.defaultPageSize = 9;
    $scope.pageSize = 9;
    $scope.data = [];

    $scope.numberOfPages = () => {
      let len = Math.ceil($scope.data.length / $scope.pageSize);
      $scope.pageArray = [];
      for (let i = 0; i < len; i++) {
        $scope.pageArray.push(i);
      }
      return len;
    }
    for (let i = 0; i < 21; i++) {
      $scope.data.push("Item " + i);
    }
    if (typeof localStorage.getItem('user') === 'undefined' || localStorage.getItem('user') === null) {
      $rootScope.login = true;
    }

  })
  // login controller
myApp.controller('LoginCtrl', function($scope, $rootScope, $http) {
  //  check login
  $scope.urlUser = 'http://localhost:3000/users';
  $scope.error = false;

  $scope.checkLogin = (username, password) => {
    let urlLogin = `${$scope.urlUser}?username=${username}&password=${password}`;
    $http.get(urlLogin).then((response) => {
      let user = response.data;
      if (user.length) {
        localStorage.setItem('user', JSON.stringify(user[0]));
        $rootScope.login = false;
        $scope.error = false;
        window.location.href = 'index.html#!/subject';
      } else {
        localStorage.setItem('user', '');
        $rootScope.login = true;
        $scope.error = true;
      }
    }, (error) => {
      console.log("k load được data");
    });
  }
});

// regis
myApp.controller('RegisCtrl', function($scope, $rootScope, $http) {
  //
  $scope.urlUser = 'http://localhost:3000/users';
  $scope.gender = true;
  $scope.regis = (username, password, fullname, email, gender, birthday) => {
    let data = {
      username: username,
      password: password,
      fullname: fullname,
      email: email,
      gender: gender,
      birthday: $("#birthday").val(),
    };
    $http.post($scope.urlUser, data).then((response) => {
      // console.log(response);
      alert("Đăng kí thành công");
      window.location.href = "#!/login";
    }, (error) => {
      console.log(error);
    })
  }

});
// Forgot pass
myApp.controller('ForgotPassCtrl', function($scope, $rootScope, $http) {

});
// Forgot pass
myApp.controller('LogoutCtrl', function($scope, $rootScope, $http) {
  $rootScope.login = true;
  localStorage.clear();
});
// 
myApp.directive('quizfpoly', function($http, $interval, $quizFactory, $routeParams) {
  return {
    restrict: "E",
    scope: [],
    templateUrl: '../layouts/template_quiz.html',
    link: function(scope, element, attribute) {
      scope.Timer = (time) => {
        return (time - (time %= 60)) / 60 + (9 < time ? ':' : ':0') + time;
      };
      scope.setTime = () => {
        let minute = 10;
        let times = minute * 60;
        scope.timer = $interval(() => {
          times -= 1;
          scope.strTime = scope.Timer(times);
          // $("#time").text(scope.Timer(times));

          if (times == 0) {
            $interval.cancel(scope.timer);
            scope.time = false;
            scope.endQuiz = true;
            scope.showQuiz = false;
          }
        }, 1000);
      }
      scope.name = $routeParams.name;
      scope.id = $routeParams.id;
      scope.logo = $routeParams.logo;
      scope.urlHistory = 'http://localhost:3000/histories';
      scope.urlUser = 'http://localhost:3000/users';

      scope.start = () => {
        if (!localStorage.getItem('user') == '') {
          $quizFactory.LoadQuestions().then(() => {
            // thời gian làm bài
            scope.strTime = '';
            scope.setTime();
            scope.time = true;
            scope.endQuiz = false;
            scope.showQuiz = true;
            scope.questionNumber = 15;
            scope.marks = {};
            scope.mark = 0;
            scope.totalScore = 0;
            scope.answersTrue = {};
            scope.answers = {};
            appendHtml(scope.questionNumber);
          });
        } else {
          window.location.href = 'index.html#!/login';
        }
      };
      // check before finish
      scope.checkSubmit = 'false';
      scope.checkFinish = () => {
        if (scope.checkSubmit) {
          $("#js-finish").removeClass("disabled");
        } else {
          $("#js-finish").addClass("disabled");
        }
      };

      // finish quiz
      scope.endTest = () => {
        scope.endQuiz = true;
        scope.showQuiz = false;
        for (const key in scope.marks) {
          if (scope.marks[key] == 1) {
            scope.mark++;
          }
        }
        $interval.cancel(scope.timer);
        scope.totalScore = (scope.mark * 10 / scope.questionNumber).toFixed(2);
      };
      // save quiz
      scope.saveQuiz = () => {
        let user = JSON.parse(localStorage.getItem('user'));
        let data = {
          user_id: user.id,
          subject: $routeParams.name,
          marks: scope.totalScore,
        };
        $http.post(scope.urlHistory, data).then((response) => {
          console.log(response.data);
        }, (error) => {
          console.log(error);
        });
      };
      // reset quiz
      scope.reset = () => {
        scope.showQuiz = false;
        scope.endQuiz = false;
      };
      // html entity
      scope.htmlEntities = (str) => {
        const htmlEntities = {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&apos;"
        };
        return str.replace(/([&<>\"'])/g, match => htmlEntities[match]);
      }

      const appendHtml = (questionNumber) => {
        let questions = $quizFactory.getQuestions(questionNumber, );
        // console.log(questions);
        let _indicator = '';
        let _inner = '';
        for (const key in questions) {
          scope.answersTrue[questions[key].Id] = questions[key].AnswerId;
          scope.marks[questions[key].Id] = 0;
          _indicator += `<button type="button" data-bs-target="#carouselQuestions"${(key =='0') ? ' class="active " aria-current="true"': ""} data-bs-slide-to="${key}" aria-label="Slide ${Number(key) + 1}">${Number(key) + 1}</button>`;
          _inner += `<div class="carousel-item ${(key ==0)? 'active': ""}">
                      <div class="question pb-3">
                        <strong ng-bind="index">
                          ${Number(key)+1}. ${scope.htmlEntities(questions[key].Text)}
                        </strong>
                      </div>
                      <div class="answer mt-2 pb-3 mb-2">`;
          let options = questions[key].Answers;
          for (const key1 in options) {
            _inner += `<div class="form-check" >
                        <input class="form-check-input" type="radio" id="${options[key1].Id}" value="${options[key1].Id}" name="${questions[key].Id}">
                        <label class="form-check-label" for="${options[key1].Id}">
                        ${scope.htmlEntities(options[key1].Text)}
                        </label>
                      </div>`;

          };
          _inner += `</div>
                    <span class="badge bg-danger" id="${questions[key].Id}">0/0</span>
                  </div>`;

        }
        $("#js-indicators").html(_indicator);
        $("#js-inners").html(_inner);

        $(document).on('change', `input[type='radio']:checked`, function() {
          // console.log(scope.answersTrue);
          let currentId = $(this).val();
          let parentId = $(this).prop('name');
          scope.answers[parentId] = currentId;
          // console.log(currentId);
          // console.log(parentId);
          if (scope.answers[parentId] == scope.answersTrue[parentId]) {
            // console.log("đúng");
            scope.marks[parentId] = 1;
            $(`.badge#${parentId}`).text('1/1').addClass('bg-success').removeClass('bg-danger');
          } else {
            // console.log("sai");
            scope.marks[parentId] = 0;
            $(`.badge#${parentId}`).text('0/1').addClass('bg-danger').removeClass('bg-success');
          }
        });
      }

    }
  }
});

myApp.factory('$quizFactory', ($http, $routeParams) => {

  let LoadQuestions = () => {
    return $http.get(`../db/Quizs/${$routeParams.id}.js`).then((response) => {
      questions = response.data;
      count = questions.length;
    }, (error) => {
      console.log("k load được data");
    });
  }

  let getQuestions = (length) => {
    let arr = [];
    let numbers = [];
    for (let i = 0; i < length; i++) {
      let number = Math.floor(Math.random() * count);
      while (numbers.includes(number)) {
        number = Math.floor(Math.random() * count);
      }
      if (!numbers.includes(number)) {
        numbers.push(number);
        arr.push(questions[number]);
      }
    }
    return arr;
  }
  return {
    LoadQuestions: LoadQuestions,
    getQuestions: getQuestions,
  };
});
//  subject controller
myApp.controller('SubjectCtrl', function($scope, $http) {
  $scope.list_subject = [];
  $scope.length = 0;
  $http.get('../db/Subjects.js').then((res) => {
    $scope.list_subject = res.data;
  }, (res) => {
    console.log("k load được data");
  });
  $scope.currentPage = 0;
  $scope.defaultPageSize = 9;
  $scope.pageSize = 9;
  $scope.data = [];

  $scope.numberOfPages = () => {
    let len = Math.ceil($scope.data.length / $scope.pageSize);
    $scope.pageArray = [];
    for (let i = 0; i < len; i++) {
      $scope.pageArray.push(i);
    }
    return len;
  }
  for (let i = 0; i < 21; i++) {
    $scope.data.push("Item " + i);
  }
});
// quiz controller
myApp.controller('QuizCtrl', function($scope, $http, $routeParams, $quizFactory) {
  $http.get(`../db/Quizs/${$routeParams.id}.js`).then((response) => {
    $quizFactory.questions = response.data;
    // console.log(questions);
  }, (error) => {
    console.log("k load được data");
  });
})
myApp.filter('startSubject', () => {
  return function(input, start) {
    start = +start; //parse to int
    return input.slice(start);
  }
});