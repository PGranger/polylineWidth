
  function polylineWidth(opt_options)
  {
    if ( opt_options.debug ) console.log('polylineWidth options',opt_options) ;

    this.debug = opt_options.debug || false ;
    this.infos = opt_options.infos || [] ;
    this.path = opt_options.path || [] ;
    
    this.strokeColor = opt_options.strokeColor || '#FF0000' ;
    this.widthInMeters = opt_options.widthInMeters || 10 ;
    this.strokeOpacity = opt_options.strokeOpacity || ( this.debug ? 0.6 : 0 ) ;

    this.isdraw = false ;
    this.polyLeft = [] ;
    this.polyRight = [] ;

    if ( opt_options.map )
    {
      this.setMap(opt_options.map) ;
      this.draw() ;
    }
  }
  
  polylineWidth.prototype = new google.maps.Polygon ;
  window['polylineWidth'] = polylineWidth ;

  polylineWidth.prototype.draw = function() {

    if ( this.path == null ) return ;
    if ( this.map == null ) return ;

    for ( var k in this.path )
    {
        var currentLatLng = new google.maps.LatLng(this.path[k]) ;
        var lastLatLng = null ;
        var nextLatLng = null ;
        var headingRight, headingLeft ;
        var cas = 0 ;

        if ( typeof this.path[parseInt(k)-1] != 'undefined' ) lastLatLng = new google.maps.LatLng(this.path[parseInt(k)-1]) ;
        if ( typeof this.path[parseInt(k)+1] != 'undefined' ) nextLatLng = new google.maps.LatLng(this.path[parseInt(k)+1]) ;

        var etat = 'lastLatLng='+lastLatLng + '<br />' +
                   'currentLatLng='+currentLatLng+'<br />' +
                   'nextLaLng='+nextLatLng+'<br />' ;

        if ( lastLatLng === null && nextLatLng !== null )
        {
          for ( var i = 0 ; i <= 180 ; i += 10 )
          {
            var heading = parseFloat(google.maps.geometry.spherical.computeHeading(currentLatLng,nextLatLng)) + 90 + i ;
            this.addPoints(heading,currentLatLng,false) ;
          }
        }

        if ( lastLatLng !== null )
        {
          headingRight = parseFloat(google.maps.geometry.spherical.computeHeading(currentLatLng,lastLatLng)) - 90 ;
          this.addPoints(headingRight,currentLatLng) ;
        }

        if ( lastLatLng !== null && nextLatLng !== null )
        {
            cas = 'intermediaires' ;
            var headingBefore = google.maps.geometry.spherical.computeHeading(currentLatLng,lastLatLng) ;
            var headingAfter = google.maps.geometry.spherical.computeHeading(currentLatLng,nextLatLng) ;
            headingBefore += 360 ; headingBefore = headingBefore % 360 ;
            headingAfter += 360 ; headingAfter = headingAfter % 360 ;
            
            headingRight = parseFloat( ( headingBefore + headingAfter ) / 2 ) ;
            if ( headingAfter > headingBefore ) headingRight += 180 ;
            headingRight += 360 ;
            
            headingRight = headingRight % 360 ;

            this.addPoints(headingRight,currentLatLng) ;
        }

        if ( nextLatLng !== null )
        {
          headingRight = parseFloat(google.maps.geometry.spherical.computeHeading(currentLatLng,nextLatLng)) + 90 ;
          this.addPoints(headingRight,currentLatLng) ;
        }

        if ( lastLatLng !== null && nextLatLng === null )
        {
          for ( var i = 0 ; i <= 180 ; i += 10 )
          {
            var heading = parseFloat(google.maps.geometry.spherical.computeHeading(currentLatLng,lastLatLng)) - 90 - i ;
            this.addPoints(heading,currentLatLng,false) ;
          }
        }

        
        if ( this.debug )
        {
          var content = etat+'<hr />'+
            'k='+k+'<br />'+
            'cas='+cas+'<br />'+
            'currentLatLng='+currentLatLng+'<br />'+
            'path[k]='+this.path[k]['lat']+','+this.path[k]['lng']+' <br /> '+
            'headingBefore='+headingBefore+'<br />'+
            'headingAfter='+headingAfter+'<br />'+
            'headingRight='+headingRight+'<br />'+
            'headingLeft='+headingLeft+'<br />' ;
            /*
            'pointLeft='+pointLeft.lat()+','+pointLeft.lng()+'<br />'+
            'pointLeft='+pointRight.lat()+','+pointRight.lng() ;
            */

          var marker = new google.maps.Marker({
            position: this.path[k],
            map: this.map,
            title: 'Uluru (Ayers Rock)'
          });
          var infowindow = new google.maps.InfoWindow() ;
          
          google.maps.event.addListener(marker,'click', (function(marker,content,infowindow){ 
            return function() {
              this.closeInfos();
              infowindow.setContent(content);
              infowindow.open(this.map,marker);
              
              infos[0]=infowindow;
              
              };
          })(marker,content,infowindow));
        }
        
    }

    new google.maps.Polyline({
      path: this.polyLeft,
      geodesic: true,
      strokeColor: '#00FF00',
      strokeOpacity: this.strokeOpacity,
      strokeWeight: 1
    }).setMap(this.map) ;

    new google.maps.Polyline({
      path: this.polyRight,
      geodesic: true,
      strokeColor: '#0000FF',
      strokeOpacity: this.strokeOpacity,
      strokeWeight: 1
    }).setMap(this.map) ;

    this.polyRight.reverse() ;
    var polys = this.polyLeft.concat(this.polyRight) ;

    var complexPoly = new google.maps.Polygon({
        map: this.map,
        paths: polys,
        strokeOpacity: 0,
        strokeWeight: 0,
        fillColor: '#FF0000',
        fillOpacity: 0.35,
    });
    ///complexPoly.setMap(this.map); 

    this.isdraw = true ;

  } ;

  polylineWidth.prototype['draw'] = polylineWidth.prototype.draw ;


  /*
  console.log(path) ;
  console.log(polyTop) ;
  console.log(polyBottom) ;
  */
  // At this point, polyTop and polyBottom should contain a pass parrallel as your initial path, but from widthInMeter/2 on left of the orig. path for polyFrom and  widthInMeter/2 on right for polyBottom.

  // It's a start, but if we want to draw a complex polygon, we need only one path of coordinates.
  // What we need to do know is "mix" the 2 pathes into one, reversing bottomPath so the path created will go from first element of polyTop, to last element of polyTop, then last element of polyBottom and finish on last element of polyBottom. It should result in a sort a huge polygon making a "tour" around your original path.

  polylineWidth.prototype.closeInfos = function() {
   
     if(infos.length > 0){
   
        /* detach the info-window from the marker ... undocumented in the API docs */
        infos[0].set("marker", null);
   
        /* and close it */
        infos[0].close();
   
        /* blank the array */
        infos.length = 0;
     }
  } ;
  polylineWidth['closeInfos'] = polylineWidth.prototype.closeInfos ;

  polylineWidth.prototype.addPoints = function(hRight,currentLatLng,both=true)
  {
    hLeft = hRight + 180 ;
    if ( hLeft > 360 ) hLeft -= 360 ;
    if ( hRight > 360 ) hRight -= 360 ;

    var pointRight = google.maps.geometry.spherical.computeOffset(currentLatLng,this.widthInMeters/2,hRight) ;
    var pointLeft  = google.maps.geometry.spherical.computeOffset(currentLatLng,this.widthInMeters/2,hLeft) ;

    if ( ! isNaN(pointLeft.lat()) && ! isNaN(pointRight.lat()) )
    {
        if ( both ) this.polyLeft.push({'lat':pointLeft.lat(),'lng':pointLeft.lng()}) ;
        this.polyRight.push({'lat':pointRight.lat(),'lng':pointRight.lng()}) ;    
    }
  }
  polylineWidth['addPoints'] = polylineWidth.prototype.addPoints ;
