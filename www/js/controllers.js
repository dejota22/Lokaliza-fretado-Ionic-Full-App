angular.module('starter')

// .controller('AppCtrl', function() {})
// .controller('LoginCtrl', function() {})
// .controller('DashCtrl', function() {});


.controller('AppCtrl', function($ionicHistory,$http, USER_ROLES, $scope, $state, $ionicModal, $ionicPopup, $ionicSideMenuDelegate, $ionicPopup, AuthService, AUTH_EVENTS, $ionicLoading) {
    $scope.username = AuthService.username();
    $scope.class = 'free';
    $scope.role = false;
    $scope.fretado = '';
    $scope.track = false;
   $scope.INTERVAL = 10000;
   $scope.api = 'https://assemblysystems.com.br/localiza/';

$scope.$on("$ionicView.enter", function () {
   $ionicHistory.clearCache();
   $ionicHistory.clearHistory();
});
    if (window.localStorage.getItem("role") == 'true') {

        $scope.role = true;
    } else {


        $scope.role = false;


    }

$scope.verMapa = function(regiao){

	// console.log(regiao);

	 $scope.fretado = regiao;
	 $state.go('main.mapa_user');


};

$scope.startTracking = function(){
	$scope.track = true;

	$scope.trackBusStart();
	 $scope.showAlert('Sucesso!', 'O seu aparelho esta sendo rastreado!');
         
      


};

$scope.stopTracking = function(){
	$scope.track = false;

	$scope.trackBusStart();
	 $scope.showAlert('Sucesso!', 'Rastreamento finalizado!');

         
      


};
$scope.trackBusStart = function(){

	if($scope.track ==true){

 $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
        var link = $scope.api+'api/coordenadas/update';
            //console.log(link);
        navigator.geolocation.getCurrentPosition(function(pos) {
           
         $http.post(link, {
            lat: pos.coords.latitude,
            long:  pos.coords.longitude,
            fretado: window.localStorage.getItem('fretado'),
            id: window.localStorage.getItem('id')
        }).then(function(res) {
        	console.log(res);
                window.setTimeout($scope.trackBusStart , $scope.INTERVAL);
            });

         });
}else{

	window.clearTimeout();
}

};
    ///modais

    $ionicModal.fromTemplateUrl('templates/cadastro.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {

        $scope.modal = modal;
    });

    $scope.modalCadastro = function() {
        $scope.modal.show();
    };

    $scope.closeModal = function() {
        $scope.modal.hide();

    };
    // Cleanup the modal when we're done with it!

    $scope.showAlert = function(title, message) {
        var alertPopup = $ionicPopup.alert({
            title: title,
            template: '<center>' + message + '</center>'
        });
    }

    $scope.loadingshow = function() {
        $ionicLoading.show({
            template: 'Carregando...'
        });
    };
    $scope.loadinghide = function() {
        $ionicLoading.hide();
    };
    //fim modais
    $scope.$on(AUTH_EVENTS.notAuthorized, function(event) {

        var alertPopup = $ionicPopup.alert({
            title: 'Não Autorizado!',
            template: 'Você não tem permissão para aceder a este recurso.'
        });
    });


    $scope.$on(AUTH_EVENTS.notAuthenticated, function(event) {
        AuthService.logout();
        $state.go('login');
        var alertPopup = $ionicPopup.alert({
            title: 'Sessão perdida!',
            template: 'Desculpe, Você precisa se logar novamente.'
        });
    });
    $scope.goto = function(toState, params) {

    	 

        $state.go(toState, {reload: true}); //remember to inject $state to your controller
      
    }
 $scope.closeModaChoice = function() {
            $scope.modalMenu.hide();

        };
    //fim marcação de assento


    $scope.cadastro = function(data) {

        if (data.nome == undefined && data.nome == null) {
            $scope.showAlert('Erro!', 'Preencha o campo Nome');
            return false;
        }
        if (data.login == undefined && data.login == null) {
            $scope.showAlert('Erro!', 'Preencha o campo Email');
            return false;
        }
        if (data.senha == undefined && data.senha == null) {
            $scope.showAlert('Erro!', 'Preencha o campo Senha');
            return false;
        }

        $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
        var link = $scope.api+'api/users/create';
        $scope.loadingshow();
        $http.post(link, {
            nome: data.nome,
            login: data.login,
            senha: data.senha
        }).then(function(res) {
            $scope.loadinghide();
            var response = res.data;

            if (response == '"success"') {

                $scope.showAlert('Sucesso!', 'Cadastro realizado com sucesso, por favor faça o login!');
                $scope.closeModal();
            }
            if (response == '"error"') {

                $scope.showAlert('Erro!', 'Ocorreu um erro ao cadastrar, por favor tente novamente');

            }
            if (response == '"empty"') {

                $scope.showAlert('Erro!', 'Preencha todos os campos!');
            }

        });
        //console.log(data);
    };
    $scope.logout = function() {
        AuthService.logout();
        $state.go('login');
    };

    $scope.setCurrentUsername = function(name) {
        $scope.username = AuthService.username();
    };
})



.controller('LoginCtrl', function($http, $scope, $state, $ionicPopup, AuthService) {
    $scope.data = {};

    $scope.login = function(data) {
        $scope.loadingshow();
        AuthService.login(data.username, data.password).then(function(authenticated) {
            $scope.loadinghide();
            $state.go('main.dash', {}, {
                reload: true
            });
            $scope.setCurrentUsername(data.username);
        }, function(err) {
            var alertPopup = $ionicPopup.alert({
                title: 'Falha na autenticação!',
                template: 'Por favor verifique suas credenciais !'
            });
            $scope.loadinghide();

        });
    };
})

.controller('MapCtrl', function($ionicHistory,$http, USER_ROLES, $scope, $state, $ionicModal, $ionicPopup, $ionicSideMenuDelegate, $ionicPopup, AuthService, AUTH_EVENTS, $ionicLoading) {


    var map,
        currentPositionMarker,
        mapCenter = new google.maps.LatLng(-23.5505199, -46.6333094),
        directionsService = new google.maps.DirectionsService(),
        map;
   
    var markerStore = {};
    $scope.markers = [];
    $scope.BusPositionMarker = [];



    function initializeMap() {

        directionsDisplay = new google.maps.DirectionsRenderer();

        var mapOptions = {
            zoom: 15,
            center: mapCenter
        }
        map = new google.maps.Map(document.getElementById("map"), mapOptions);
        directionsDisplay.setMap(map);




    }
    $scope.initialise = function() {

        var myLatlng = new google.maps.LatLng(37.3000, -120.4833);
        var mapOptions = {
            center: myLatlng,
            zoom: 16,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        var map = new google.maps.Map(document.getElementById("map"), mapOptions);
        // Geo Location /
        navigator.geolocation.getCurrentPosition(function(pos) {
            map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
            var myLocation = new google.maps.Marker({
                position: new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude),
                map: map,
                icon: 'img/male-2.png',
                animation: google.maps.Animation.DROP,
                title: "My Location"
            });
        });
        $scope.map = map;
        // Additional Markers //
        $scope.markers = [];
        var infoWindow = new google.maps.InfoWindow();
        var createMarker = function(info) {
            var marker = new google.maps.Marker({
                position: new google.maps.LatLng(info.lat, info.long),
                icon: 'img/bus.jpg',
                map: $scope.map,
                animation: google.maps.Animation.DROP,
                // title: info.city
            });
            marker.content = '<div class="infoWindowContent"></div>';
            google.maps.event.addListener(marker, 'click', function() {
                infoWindow.setContent('<h2>' + marker.title + '</h2>' + marker.content);
                infoWindow.open($scope.map, marker);
            });
            $scope.markers.push(marker);
        }



       


        function getMarkers() {
            $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
            var link = $scope.api+'api/coordenadas/' + $scope.fretado + '/';
            //console.log(link);
            $http.get(link).then(function(res) {
                var length = Object.keys(res.data).length;
                // console.log(res);

                for (var i = 0, len = length; i < len; i++) {
                    console.log(res.data[i].id);
                    //Do we have this marker already?
                    if (markerStore.hasOwnProperty(res.data[i].id)) {
                        //console.log('just funna move it...');
                        markerStore[res.data[i].id].setPosition(new google.maps.LatLng(res.data[i].lat, res.data[i].long));
                    } else {

                        var marker = new google.maps.Marker({
                            position: new google.maps.LatLng(res.data[i].lat, res.data[i].long),
                            // title:res[i].name,
                            icon: 'img/bus.jpg',
                            map: $scope.map
                        });
                        markerStore[res.data[i].id] = marker;
                        //console.log(marker.getTitle());
                    }
                }
                window.setTimeout(getMarkers, $scope.INTERVAL);
            }, "json");
        }


        getMarkers();

    };
    google.maps.event.addDomListener(document.getElementById("map"), 'load', $scope.initialise());
})

.controller('DashCtrl', function($http, $scope, $state, $ionicModal, $ionicPopup, $ionicSideMenuDelegate, $ionicPopup, AuthService, AUTH_EVENTS, $ionicLoading, USER_ROLES) {

 var regiao = '';
$ionicModal.fromTemplateUrl('templates/Choice.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {

            $scope.modalMenu = modal;
        });

		 $scope.choice = function(regiao) {

		 	if(regiao=='capital'){

		 		$scope.regiao = 'capital';
		 		
		 	}if(regiao=='litoral'){
		 		$scope.regiao = 'litoral';
		 	

		 	}if(regiao=='interior'){
		 		$scope.regiao = 'interior';
		 		

		 	}else{
		 		
		 	}
		 	
		 $scope.modalMenu.show();

		 };

 $scope.closeModaChoice = function() {
            $scope.modalMenu.hide();

        };
       

})

.controller('MenuCtrl', function($http, $scope, $state, $ionicModal, $ionicPopup, $ionicSideMenuDelegate, $ionicPopup, AuthService, AUTH_EVENTS, $ionicLoading, USER_ROLES) {




        $ionicModal.fromTemplateUrl('templates/adminChoice.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {

            $scope.modalAdm = modal;
        });

        $scope.modalAdmin = function() {

            if (window.localStorage.getItem("role") == 'true') {

                $scope.role = true;
            } else {


                $scope.showAlert('ERRO!', 'Você não tem permissão para acessar essa função');

                $scope.role = false;
                return false;

            }


            $scope.modalAdm.show();
        };

        $scope.closeModaAdmin = function() {
            $scope.modalAdm.hide();

        };



        var regiao = '';
$ionicModal.fromTemplateUrl('templates/Choice.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {

            $scope.modalMenu = modal;
        });

		 $scope.choice = function(regiao) {

		 	if(regiao=='capital'){

		 		$scope.regiao = 'capital';
		 		
		 	}if(regiao=='litoral'){
		 		$scope.regiao = 'litoral';
		 	

		 	}if(regiao=='interior'){
		 		$scope.regiao = 'interior';
		 		

		 	}else{
		 		
		 	}
		 	
		 $scope.modalMenu.show();

		 };
		 
 $scope.closeModaChoice = function() {
            $scope.modalMenu.hide();

        };




    })
    .controller('AdminCtrl', function($scope, $state, $http, $ionicPopup, AuthService, USER_ROLES) {
        $scope.closeModaAdmin();


        //marcação de assento
        $scope.markSeat = function(id) {
            var element = angular.element(document.querySelector("." + id)).hasClass("free");
            if (element == true) {

                var element = angular.element(document.querySelector("." + id)).removeClass("free");
            } else if (element == false) {
                var element = angular.element(document.querySelector("." + id)).addClass("free");
            }

        }
        $scope.unmarkAll = function() {


            var element = angular.element(document.querySelectorAll("#banco")).addClass("free");


            //element.style.background = 'red';


        };


    });