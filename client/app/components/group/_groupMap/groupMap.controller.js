class GroupMapController {
  constructor($scope, CurrentGroup, CurrentStores, CurrentUsers, $timeout) {
    "ngInject";
    Object.assign(this, {
      $scope,
      CurrentGroup,
      CurrentStores,
      CurrentUsers,
      $timeout,
      markers: {},
      bounds: {},
      center: {},
      defaults: {
        scrollWheelZoom: false
      }
    });
  }

  $onInit() {
    // deep watching
    this.destroy = this.$scope.$watch(() => this.CurrentStores.list, () => {
      this.$timeout(() => this.update(), 200);
    }, true);
    this.CurrentGroup.map = {
      showOverview: () => {
        this.showOverview();
      },
      showLatLngZ: (lat, lng, z = 15) => {
        this.showLatLngZ(lat, lng, z);
      },
      update: () => {
        this.update();
      },
      options: {
        showStores: true,
        showUsers: false
      }
    };
  }

  $onDestroy() {
    this.destroy();
  }

  reCenter(){
    if (this.hasMarkers()){
      if (angular.isDefined(this.center.lat) && this.center.lat !== 0){
        this.showLatLngZ(this.center.lat, this.center.lng, this.center.zoom);
      } else {
        this.showOverview();
      }
    }
  }

  showOverview(){
    if (this.hasMarkers()){
      let bounds = new L.latLngBounds(Object.values(this.markers)).pad(0.15); // eslint-disable-line
      this.bounds = {
        northEast: bounds._northEast,
        southWest: bounds._southWest,
        options: {
          maxZoom: 12
        }
      };
    }
  }

  showLatLngZ(lat, lng, z = 15){
    this.center = {
      lat,
      lng,
      zoom: z
    };
  }

  getUsers(userIdArray){
    return userIdArray.map((id) => {
      return this.CurrentUsers.get(id);
    });
  }

  update() {
    this.markers = this.getMarkers(this.CurrentStores.list);
    this.reCenter();
  }

  hasMarkers() {
    return Object.keys(this.markers).length > 0;
  }

  getMarkers(fromArray) {
    let markers = {};
    if (this.CurrentGroup.map.options.showStores){
      angular.forEach(fromArray, (e) => {
        if (!e.latitude || !e.longitude) return;
        markers["store_" + e.id] = {
          lat: e.latitude,
          lng: e.longitude,
          message: `<a ui-sref='group.store({ storeId: ${e.id}, groupId: ${e.group} })'>${e.name}</a>`,
          draggable: false,
          icon: {
            type: "awesomeMarker",
            icon: "shopping-cart",
            prefix: "fa",
            markerColor: "darkblue"
          }
        };
      });
    }

    if (this.CurrentGroup.map.options.showUsers){
      let allUsers = this.getUsers(this.CurrentGroup.value.members);
      angular.forEach(allUsers, (e) => {
        if (!e.latitude || !e.longitude) return;
        markers["user_" + e.id] = {
          lat: e.latitude,
          lng: e.longitude,
          message: `<a ui-sref='userDetail({ id: ${e.id} })'>${e.display_name}</a>`,
          draggable: false,
          icon: {
            type: "awesomeMarker",
            icon: "user",
            prefix: "fa",
            markerColor: "green"
          }
        };
      });
    }

    return markers;
  }
}

export default GroupMapController;
