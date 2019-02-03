import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import "./App.js"
import "./gradients.css"

class HomePage extends React.Component {
	render() {
		return (
			<div className="HomeGradient" style={{minHeight: '100vh'}}>
				<div style={{fontSize: "6em", width: '100%', paddingTop: '8vh'}}>
					Welcome to Mind AID.
				</div>
				<div style={{fontSize: '2em', width: '100%'}}>
					We use machine learning to <br/>improve your lifestyle and wellbeing</div>
				<Link to='/addentry'><Button 
					variant="outlined" 
					color="primary"
					style={{marginTop: "20vh", minHeight: '10vh', minWidth: '30vh', fontSize: '1.5em'}} 
					size="large">Get started</Button></Link>
			</div>
		)
	}
}

export default HomePage