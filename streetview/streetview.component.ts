import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-streetview',
  templateUrl: './streetview.component.html',
  styleUrls: ['./streetview.component.css']
})
export class StreetviewComponent implements AfterViewInit {

  @ViewChild('panoContainer') gpano: ElementRef;
  @Input() dashboard;
  @Input() selectedInterval;
  eventLocations = [];
  panorama: google.maps.StreetViewPanorama;
  streetViewService: google.maps.StreetViewService;
  panoramaOptions: google.maps.StreetViewPanoramaOptions;
  initialLocation;
  backwardHeaded = false;
  backwardHeadedCount = 0;
  constructor() { }

  ngAfterViewInit() {
    this.initStreetView();
  }

  initStreetView = () => {

    this.streetViewService = new google.maps.StreetViewService();
    const data = this.dashboard.data;
    if (this.selectedInterval !== undefined) {
       this.initialLocation = this.calcLatLng(this.selectedInterval[0]);
    } else {
       this.initialLocation = {lat: data[0].map.lat, lng: data[0].map.lng};
    }
    this.panoramaOptions = {
      position: this.initialLocation,
      enableCloseButton: false,
      addressControl: true,
      panControl: false,
      visible: true,
      clickToGo: false,
      zoomControl: false,
      fullscreenControl: false,
      mode : 'html5'
    };
    this.panorama = new google.maps.StreetViewPanorama(
      this.gpano.nativeElement, this.panoramaOptions);
    this.panorama.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(document.getElementById('streetview-or-map'));
    google.maps.event.addListener(this.panorama, 'links_changed', () => {
          const links =  this.panorama.getLinks();
          if (this.backwardHeadedCount === 0) {
            this.backwardHeadedCount++;
            if (links[0].heading > 180) {
              this.backwardHeaded = true;
            }
          }
          let pov;
          if (this.backwardHeaded) {
            pov = links[1].heading;
          } else {
            pov = links[0].heading;
          }
        this.panorama.setPov({
        heading: pov,
        pitch: 0
        });
    });
  }

  play(current) {
    // console.log('Street play: ' + current);
    const playLocation = this.calcLatLng(current);
    if (playLocation.lat !== this.initialLocation.lat || playLocation.lng !== this.initialLocation.lng) {
      this.initialLocation = playLocation;
      this.streetViewService.getPanorama({location: this.calcLatLng(current),
        radius: 10, preference: google.maps.StreetViewPreference.NEAREST},
        this.processSVData);
    }
  }

  calcLatLng(time) {
    const data = this.dashboard.data;
    for (let i = 0; i < data.length; i++) {
      if (time === data[i].date) {
        // const latlng = {lat: data[i].map.lat, lng: data[i].map.lng};
        // console.log('One' + latlng);
        return {lat: data[i].map.lat, lng: data[i].map.lng};
        // this.initialLocation = {lat: data[i].map.lat, lng: data[i].map.lng};
        // return this.initialLocation;
      }
      if (time < data[i].date) {
        // const latlng = {lat: data[i - 1].map.lat, lng: data[i - 1].map.lng};
        // console.log('Two' + latlng.lat + '' + latlng.lng);
        // this.initialLocation =  {lat: data[i - 1].map.lat, lng: data[i - 1].map.lng};
        // return this.initialLocation;
        return {lat: data[i - 1].map.lat, lng: data[i - 1].map.lng};
      }
    }
  }

  highlight(interval) {
    this.play(interval[0]);
  }

  processSVData = (
    data: google.maps.StreetViewPanoramaData | null,
    status: google.maps.StreetViewStatus
  ) => {
    if (status === 'OK') {
      const location = (data as google.maps.StreetViewPanoramaData)
        .location as google.maps.StreetViewLocation;
      this.panorama.setPosition(location.latLng);
      this.panorama.setVisible(true);

    } else {
      console.error('Street View data not found for this location.');
    }
  }

  degreesToRadian = (degrees) => {
    return (Math.PI * degrees) / 180;
  }

  radiansToDegrees = (radians) => {
    return (radians * 180) / Math.PI;
  }

  calculatePOV(pointA, pointB) {
    /**
    Calculates the bearing between two points.
    The formulae used is the following:
        θ = atan2(sin(Δlong).cos(lat2),
                  cos(lat1).sin(lat2) − sin(lat1).cos(lat2).cos(Δlong))
    :Parameters:
      - `pointA: The tuple representing the latitude/longitude for the
        first point. Latitude and longitude must be in decimal degrees
      - `pointB: The tuple representing the latitude/longitude for the
        second point. Latitude and longitude must be in decimal degrees
    :Returns:
      The bearing in degrees
    :Returns Type:
      float
    **/

    const lat1 = this.degreesToRadian(pointA[0]);
    const lat2 = this.degreesToRadian(pointB[0]);

    const diffLong = this.degreesToRadian(pointB[1] - pointA[1]);

    const x = Math.sin(diffLong) * Math.cos(lat2);
    const y = Math.cos(lat1) * Math.sin(lat2) - (Math.sin(lat1)
            * Math.cos(lat2) * Math.cos(diffLong));

    let initial_bearing = Math.atan2(x, y);

    /**
    # Now we have the initial bearing but math.atan2 return values
    # from -180° to + 180° which is not what we want for a compass bearing
    # The solution is to normalize the initial bearing as shown below */

    initial_bearing = this.radiansToDegrees(initial_bearing);
    const compass_bearing = (initial_bearing + 360) % 360;

    console.log('POV: ' + compass_bearing);
    return compass_bearing;
  }
}
