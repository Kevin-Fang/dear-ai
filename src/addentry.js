import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import { Link, Redirect } from 'react-router-dom';
import TextField from '@material-ui/core/TextField';
import Axios from 'axios';
import CircularProgress from '@material-ui/core/CircularProgress';

import "./gradients.css"

var request = require('request')
let server = require('./config.json').server

class AddEntry extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			userText: "",
			redirect: false,
			buttonDisabled: true,
			loading: false
		}
	}
	handleTextChange = (event, value) => {
		this.setState({
			userText: event.target.value
		}, () => {
			if (this.state.userText.length > 0) {
				this.setState({
					buttonDisabled: false
				})
			} else {
				this.setState({
					buttonDisabled: true
				})
			}
		})
	}

	handleSubmit = () => {
		this.setState({
			loading: true
		})
		var options = { method: 'POST',
		  url: `${server}/sentiment`,
		  headers: 
		   {
		     'Content-Type': 'application/x-www-form-urlencoded' },
		  form: 
		   { sentence: this.state.userText} };

		request(options, (error, response, body) => {
		  if (error) throw new Error(error);

		  this.setState({
		  	redirect: JSON.parse(body).emotion
		  })
		});

	}
	render() {
		if (this.state.redirect) {
			return <Redirect push to={`/results/${this.state.redirect}`} />
		} else {
			return (
				<div className="EntryGradient" style={{minHeight: '90vh'}}>
					<div style={{fontSize: '3em', paddingTop: '10vh', color: '#333333'}}>How are you feeling?</div>
					<div style={{fontSize: '2em', color: '#333333'}}>What happened today?</div>
					<TextField
			          id="standard-multiline-flexible"
			          label="Jot your thoughts down..."
			          style={{minWidth: '60vw', minHeight: '40vh'}}
			          multiline
			          value={this.state.userText}
			          onChange={this.handleTextChange}
	 				  inputProps={{
					    style: {
					    	fontSize: '2em',
					    	lineHeight: '1.5em'
					    } 
				      }}
			          rows="4"
			          hint="Tell me how it went.."
			          margin="normal"
			        /><br/>
			        {this.state.loading && <div><CircularProgress /></div>}
					<Button 
						variant="filled" 
						color="primary"
						disabled={this.state.buttonDisabled}
						onClick={this.handleSubmit}
						style={{minHeight: '10vh', minWidth: '30vh', fontSize: '1.5em'}} 
						size="large">Save
					</Button>
				</div>
			);
		}
	}
}

export default AddEntry