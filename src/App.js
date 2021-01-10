import React from "react";
import ReactDOM from 'react-dom';
// import './App.css';

//Places API
import {
  GoogleMap,
  useLoadScript,
  Marker,
  InfoWindow } from '@react-google-maps/api'
import { formatRelative } from 'date-fns'

// Autocomplete places
import
usePlacesAutocomplete,
{ getGeocode,
  getLatLng
} from 'use-places-autocomplete'


//Display results
import {
  Combobox,
  ComboboxInput,
  ComboboxPopover,
  ComboboxList,
  ComboboxOption
} from '@reach/combobox'


//Material UI
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import NavigationIcon from '@material-ui/icons/Navigation';

import '@reach/combobox/styles.css'

import mapStyles from './mapStyles'
import toiletMarker from './img/toilet-marker.svg'

const
  libraries = ['places'],
  mapContainerStyle = {
    width: '100vw',
    height: '100vh'
  },
  center = {
    lat: 51.449580,
    lng: -0.004190
  },
  options = {
    styles: mapStyles,
    disableDefaultUI: true,
  }

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    color: '#fff'
  },
  addNewBtn: {
    margin: theme.spacing(1),
    position: 'absolute',
    bottom: 20, 
    right: 20,
    zIndex: 5
  },
  extendedIcon: {
    marginRight: theme.spacing(1),
  },
  locateBtn: {
    marginLeft: 'auto',
    boxShadow: 'none !important',
    // borderRadius: 0
  },

}));

export default function App() {

  const classes = useStyles();

  //Google Maps set up, set api key and tell what library to use
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: libraries,
  })



  //Set State
  const [markers, setMarkers] = React.useState([])
  const [selected, setSelected] = React.useState(null)


  //Place marker
  const onMapClick = React.useCallback( (e) => {
    setMarkers(current => [...current, {
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
      time: new Date()
    }])
  }, [] )


  //save reference to the map to access anywhere in the code without re-rendering
  //(ref doesnt cause rerenders)
  const mapRef = React.useRef()
  const onMapLoad = React.useCallback( (map) => {
    mapRef.current = map
  }, [] )

  const panTo = React.useCallback( ({ lat, lng}) => {
    mapRef.current.panTo({ lat,lng })
    mapRef.current.setZoom(17)
  }, [])


  if(loadError) return "Error loading maps"
  if(!isLoaded) return "Loading Maps..."
  return (
    <div className="App">
      <div className={classes.root}>
        <AppBar position="fixed">
          <Toolbar>
            <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" className={classes.title}>
              Toilet Finder <span role="img" aria-label="toilet">🚽</span>
            </Typography>
            <Locate panTo={ panTo } />
          </Toolbar>
        </AppBar>
      </div>
      {/* <h1>Toilet Finder <span role="img" aria-label="toilet">🚽</span></h1>
      <Search panTo={ panTo } />
      <Locate panTo={ panTo } /> */}

      <FloatingActionButtonSize />

    <GoogleMap
      mapContainerStyle={ mapContainerStyle }
      zoom={15}
      center={ center }
      options={ options }
      onClick={ onMapClick }
      onLoad={ onMapLoad }
    >
      {/* map markers for each click */}
      {markers.map( marker => (
        <Marker
          key={marker.time.toISOString()}
          position={{
            lat: marker.lat,
            lng: marker.lng
          }}
          icon={{
            url: toiletMarker,
            scaledSize: new window.google.maps.Size(45,45),
            //if using a different (non arrow style) marker change origin and anchor below
            // origin: new window.google.maps.Point(0,0),
            // anchor: new window.google.maps.Point(15,15),
          }}
          onClick={ () => {
            setSelected(marker)
          }}
        />) )}

        {/* Infowindows */}
        {
          selected
          ? (
            <InfoWindow
              position={{ lat: selected.lat, lng: selected.lng }}
              onCloseClick={ () => {
                setSelected(null)
              }}
              options={{
                pixelOffset: new window.google.maps.Size(0, -45)
              }}
            >
            <React.Fragment>
              <h2>Toilet Logged</h2>
              <p>Logged { formatRelative( selected.time, new Date() ) }</p>
            </React.Fragment>
          </InfoWindow>)
          : null
        }
        

    </GoogleMap>
    </div>
  );
}

function Locate({ panTo }){
  const classes = useStyles();
  return (
    <Fab
    onClick={() => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          panTo({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => null
      );
    }}
    variant="extended"
    color="primary"
    aria-label="locate"
    className={classes.locateBtn}
    >
      <NavigationIcon className={classes.extendedIcon} /><Typography variant="p" className={classes.title}>Locate Me</Typography>
    </Fab>
  )
}

function Search({ panTo }) {

  const {
    ready,
    value,
    suggestions:
    { status, data },
    setValue,
    clearSuggestions
  } = usePlacesAutocomplete({ 
    requestOptions: {
      location: { lat: () => center.lat, lng: () => center.lng},
      //approx 2 miles - 20 min walk
      radius: 3200
    }
  })

  return (
    <div className="search">
      <Combobox
        onSelect={ async (address) => {
          setValue(address, false)
          clearSuggestions()

          try{            
            const results = await getGeocode({address})
            console.log(address)
            const { lat, lng } = await getLatLng(results[0])
            panTo({ lat, lng })
            // console.log( `panning to: ${lat}, ${lng}`)
          } catch(err){
            console.log(err)
          }

          // console.log(address)
        }}
      >
        <ComboboxInput
          value={ value }
          onChange={ (e) => {
            setValue( e.target.value )
          }}
          disabled={ !ready }
          placeholder="Start typing a place name or address..."
        />
        <ComboboxPopover>
          <ComboboxList>
          {status === 'OK' && data.map( ( { id, description}) => (
            <ComboboxOption
              key={ id }
              value={ description }
            ></ComboboxOption>
          ))}
          </ComboboxList>
        </ComboboxPopover>
      </Combobox>
    </div>
  )

}

function FloatingActionButtonSize() {
  const classes = useStyles();

  return (
    <Fab
      variant="extended"
      color="primary"
      aria-label="add"
      className={classes.addNewBtn}
      onClick={ () => {
          console.log('adding new')
        }
      }
    >
      <AddIcon className={classes.extendedIcon} />
      Add New
    </Fab>
  );
}