import React, { Component } from 'react';
import axios from 'axios';
import Pusher from 'pusher-js';
import Spinner from 'react-spinkit';
import './App.css';

class App extends Component {
  constructor() {
    super();
    this.state = {
      images: [],
      selectedFile: null,
      loading: false,
    };
  }

  componentDidMount() {
    this.setState({
      loading: true,
    });

    axios.get('http://localhost:4000').then(({ data }) => {
      this.setState(prevState => {
        return {
          images: [...data, ...prevState.images],
          loading: false,
        };
      });
    });

    const pusher = new Pusher('7522d91149ec8ffb4f7d', {
      cluster: 'us2',
      encrypted: true,
    });

    const channel = pusher.subscribe('gallery');
    channel.bind('upload', data => {
      this.setState(prevState => {
        return {
          images: [data.image, ...this.state.images],
        };
      });
    });
  }

  fileChangedHandler = event => {
    const file = event.target.files[0];
    this.setState({ selectedFile: file });
  };

  uploadImage = event => {
    event.preventDefault();

    if (!this.state.selectedFile) return;

    this.setState({
      loading: true,
    });

    // console.log('selectedFile', this.state.selectedFile);
    // console.log('selectedFile.name', this.state.selectedFile.name);
    

    const formData = new FormData();
    formData.append(
      'image',
      this.state.selectedFile,
      this.state.selectedFile.name
    );
    // const formData = { 
    //   filename: this.state.selectedFile.name
    // };

    //console.log('FORMDATA', formData);

    axios.post('http://localhost:4000/upload', formData).then(({ data }) => {
      this.setState({
        loading: false,
      });
    });
  };

  render() {
    const image = (url, index) => (
      <img alt="" className="photo" key={index} src={url} />
    );

    const images = this.state.images.map(e => image(e.secure_url, e._id));

    return (
      <div className="App">
        <h1 className="App-title">Rita Barry's Gallery</h1>

        <form id="myform" method="post" encType="multipart/form-data" onSubmit={this.uploadImage}>
          <label className="label" htmlFor="gallery-image">
            Choose an image to upload
          </label>
          <input
            type="file"
            onChange={this.fileChangedHandler}
            id="gallery-image"
            accept=".jpg, .jpeg, .png"
          />
          <button type="submit">Upload!</button>
        </form>

        <div className="loading-indicator">
          {this.state.loading ? <Spinner name="spinner" /> : ''}
        </div>

        <div className="gallery">{images}</div>
      </div>
    );
  }
}

export default App;