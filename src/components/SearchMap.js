import React from "react";
import ReactDOM from 'react-dom';

// Autocomplete places
import
usePlacesAutocomplete,
{ getGeocode,
  getLatLng
} from 'use-places-autocomplete'

//Display results
import { Combobox, ComboboxInput, ComboboxPopover, ComboboxList, ComboboxOption } from '@reach/combobox'
import '@reach/combobox/styles.css'

export default function SearchMap( props, panTo  ) {
  const {
    ready,
    value,
    suggestions:
    { status, data },
    setValue,
    clearSuggestions
  } = usePlacesAutocomplete({ 
    requestOptions: {
      location: { lat: () => this.props.center.lat, lng: () => this.props.center.lng},
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