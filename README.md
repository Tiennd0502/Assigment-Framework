  getQuestions: function() {
    return $http.get('../db/Quizs/' + $routeParams.id + '.js').then(function(res) {
        questions = res.data;
    });
},
getQuestion: function(id) {
    var randomItem = questions[Math.floor(Math.random() * questions.length)]
    var count = questions.length;
    if (count > 10) {
        count = 10;
    }

    if (id < 10) {
        return randomItem;
    } else {
        return false;
    }

}