import React from 'react'

export default class NewToilet extends React.Component {
  state = {
    lat: 0,
    lng: 0,
    name: '',
    address: {}
  }
  
  render() {
    return (
      <div className="newToilet">
        Form
      </div>
    )
  }
}
