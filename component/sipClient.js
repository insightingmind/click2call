import React from "react";
import * as JsSIP from "jssip";
import Dialer from "./Dialer";
let status = ["ended", "failed"];
export default class SipClient extends React.Component {
	constructor(props) {
		super(props);
		this.props = props;
		this.socket = null; // FILL WSS SERVER
		this.configuration = null;
		this.incomingCallAudio = null;
		this.remoteAudio = null;
		this.callOptions = {
			mediaConstraints: { audio: true, video: false },
		};
		this.isConnected = false;
		this.phone = null;
		this.session = null;
		this.state = {
			update: false,
			uri: "4call-dev-licensing.qspldev.com",
			username: "4000",
			password: "123456",
			status: "ended",
			number: 4002,
			outGoing: false,
			isConnected: false,
			isIncomming: false,
			isDialerHide: false,
		};
		this.connectToSip = this.connectToSip.bind(this);
		this.onChange = this.onChange.bind(this);
		this.clickToCall = this.clickToCall.bind(this);
		this.audioPause = this.audioPause.bind(this);
	}
	onChange(event) {
		let state = this.state;
		this.state[event.target.name] = event.target.value;
		this.setState(() => state);
	}
	connectToSip() {
		let { username, uri, password } = this.state;
		let port = this.state.port || 8089;
		//4call-dev-licensing.qspldev.com:8089
		this.socket = new JsSIP.WebSocketInterface(`wss://${uri}:${port}/ws`);
		this.configuration = {
			sockets: [this.socket],
			uri: `sip:${username}@${this.uri}`, // FILL SIP URI HERE like sip:sip-user@your-domain.bwapp.bwsip.io
			password: password, // FILL PASSWORD HERE,
			username: username, // FILL USERNAME HERE
			register: true,
		};
		this.initiateRTPConnection();
	}
	clickToCall() {
		let { number } = this.state;
		let state = this.state;
		state.outGoing = true;
		this.setState(state);
		// console.log(typeof number);
		this.phone.call(String(number), this.callOptions);
	}
	answerCall() {
		this.incomingCallAudio.pause();
		this.session.answer(this.callOptions);
	}
	hangUpAndReject() {
		this.incomingCallAudio.pause();
		this.session.terminate();
		this.forceUpdate();
	}
	cancelCall() {
		this.incomingCallAudio.pause();
		this.session.terminate();
		this.forceUpdate();
	}
	mute() {
		console.log("MUTE CLICKED");
		if (session.isMuted().audio) {
			session.unmute({ audio: true });
		} else {
			session.mute({ audio: true });
		}
		updateUI("mute");
	}
	updateUi(status) {
		let state = this.state;
		state.update = state.update;
		state.status = status;
		console.log("status", status);
		this.setState(state);
	}
	audioPause() {
		this.incomingCallAudio.pause();
		return (
			<legend className='pa0 f5 f4-ns mt3 black-80'>
				On Call with : {this.session.remote_identity.uri.user}
			</legend>
		);
	}
	componentDidMount() {
		this.incomingCallAudio = new window.Audio(
			"https://file-examples-com.github.io/uploads/2017/11/file_example_WAV_1MG.wav"
		);
		this.incomingCallAudio.loop = true;
		this.incomingCallAudio.crossOrigin = "anonymous";
		this.remoteAudio = new window.Audio();
		this.remoteAudio.autoplay = true;
		this.remoteAudio.crossOrigin = "anonymous";
		this.callOptions = {
			mediaConstraints: { audio: true, video: false },
		};
	}
	initiateRTPConnection() {
		JsSIP.debug.disable("JsSIP:*");
		this.phone = new JsSIP.UA(this.configuration);
		console.log("");
		this.phone.on("registrationFailed", (ev) => {
			alert("Registering on SIP server failed with error: " + ev.cause);
			this.isConnected = false;
			// configuration.uri = null;
			// thisconfiguration.password = null;
			this.updateUi("registrationFailed");
		});
		this.phone.on("registered", (ev) => {
			let state = this.state;
			state.isConnected = true;
			this.setState(state);
		});
		this.phone.on("newRTCSession", (ev) => {
			console.log("create session");
			var newSession = ev.session;
			if (this.session) {
				// hangup any existing call
				this.session.terminate();
			}
			this.session = newSession;
			var completeSession = (status) => {
				this.session = null;
				this.updateUi(status);
			};
			this.session.on("ended", () => completeSession("ended"));
			this.session.on("failed", (ev) => {
				console.log("status:failed", ev);
				this.incomingCallAudio.pause();
				completeSession("failed");
			});
			this.session.on("accepted", () => this.updateUi("accepted"));
			this.session.on("confirmed", () => {
				// console.log("status:confirmed", ev);

				var localStream = this.session.connection.getLocalStreams()[0];
				var dtmfSender = this.session.connection.createDTMFSender(localStream.getAudioTracks()[0]);
				this.session.sendDTMF = function (tone) {
					dtmfSender.insertDTMF(tone);
				};
				this.updateUi("confirmed");
			});
			this.session.on("peerconnection", (e) => {
				console.log("peerconnection", e);
				// console.log("status:peerconnection", ev);

				let logError = "";
				const peerconnection = e.peerconnection;
				// console.log("status:e.peerconnection", e.peerconnection);
				peerconnection.onaddstream = (e) => {
					console.log("status:addstream", this.remoteAudio);
					// set remote audio stream (to listen to remote audio)
					// remoteAudio is <audio> element on pag
					this.remoteAudio.srcObject = e.stream;
					this.remoteAudio.play();
				};

				var remoteStream = new MediaStream();
				// console.log("status:peerconnection.getReceivers", peerconnection.getReceivers());
				peerconnection.getReceivers().forEach(function (receiver) {
					// console.log(receiver);
					remoteStream.addTrack(receiver.track);
				});
			});

			if (this.session.direction === "incoming") {
				this.incomingCallAudio.play();
				let state = this.state;
				state.isIncomming = true;
				// this.setState(state);
			} else {
				// console.log("con", this.session.connection);
				this.session.connection.addEventListener("addstream", (e) => {
					this.incomingCallAudio.pause();
					this.remoteAudio.srcObject = e.stream;
				});
			}
			this.updateUi("newRTCSession");
		});
		this.phone.start();
	}
	render() {
		// console.log("session", this.state);
		// let caller =
		// 	this.session && this.session.remote_identity && this.session.remote_identity.uri ? (
		// 		<p>{this.session.remote_identity.uri}</p>
		// 	) : (
		// 		""
		// 	);
		let onCallComp =
			this.session && this.session.isEstablished() ? (
				<button
					className='f6 f5-l button-reset fl pv3 tc bn bg-animate bg-red  white pointer w-100 w-25-m w-100-l br2-ns br--right-ns'
					type='submit'
					onClick={(event) => this.hangUpAndReject(event)}
					value='Answer'>
					Reject
				</button>
			) : (
				""
			);
		// this.session && this.session.isInProgress() &&
		//  this.session.direction === "incoming"
		let incomingCall =
			this.session && this.session.isInProgress() ? (
				this.session.direction === "incoming" ? (
					<fieldset className='bg-white  flex cf bn ma0 pa0'>
						<div class='flex items-start justify-center'>
							<div class='flex flex-column'>
								<div class=' w-100 pa3 mt2  w-50'>
									<img
										className='f6 f5-l fl pv3 tc bn bg-animate white pointer w-100 w-25-m w-40-l br2-ns br--right-ns'
										src='/recieve.png'
										onClick={(event) => this.answerCall(event)}
										style={{ height: "50px", width: "50px" }}
									/>
									<div class=''>Accept</div>
								</div>
							</div>
							<div class='flex flex-column'>
								<div class=' w-100 pa3 mt2 '>
									<img
										className='f6 f5-l  fl pv3 tc bn bg-animate white pointer w-100 w-25-m w-40-l br2-ns br--right-ns'
										onClick={(event) => this.hangUpAndReject(event)}
										// className='f6 f5-l button-reset fl pv3 tc bn bg-animate bg-red  white pointer w-100 w-25-m w-40-l br2-ns br--right-ns'
										src='/cut.png'
										style={{ height: "50px", width: "50px" }}
									/>
									<div>Reject</div>
								</div>
							</div>
						</div>
					</fieldset>
				) : (
					<div class='flex flex-wrap'>
						<div class=' w-50 pa3 mr2'>
							<h1 className='blinking'>Ringing ...</h1>
						</div>
						<div class=' w-25 pa3 mr2'>
							<img
								className='f6 f5-l input-reset bn fl black-80  pa3 lh-solid w-100 w-75-m w-80-l br2-ns br--left-ns'
								onClick={(event) => this.hangUpAndReject(event)}
								// className='f6 f5-l button-reset fl pv3 tc bn bg-animate bg-red  white pointer w-100 w-25-m w-40-l br2-ns br--right-ns'
								src='/cut.png'
								style={{ height: "50px", width: "50px" }}
							/>
						</div>
					</div>
				)
			) : (
				""
			);

		let callingComp =
			this.state.isConnected && status.includes(this.state.status) ? (
				<fieldset className='cf  bn ma0 pa0'>
					{/* <legend className='pa0 f5 f4-ns mb3 black-80'>Please Enter Your Number To Call</legend> */}
					<div className='cf mw5 mw7-ns center   pa3 ph5-ns'>
						{/* <label className='clip'>Email Address</label> */}
						<input
							className='f6 f5-l input-reset bn  mt3 fl black-80 bg-white pa3 lh-solid w-100 w-75-m w-80-l br2-ns br--left-ns'
							placeholder='Extension'
							type='number'
							value={this.state.number}
							onChange={(event) => this.onChange(event)}
							name='number'
							id='number'
						/>
						<img
							className='f6 f5-l input-reset bn fl black-80  pa3 lh-solid w-100 w-75-m w-80-l br2-ns br--left-ns'
							onClick={(event) => this.clickToCall(event)}
							// className='f6 f5-l button-reset fl pv3 tc bn bg-animate bg-red  white pointer w-100 w-25-m w-40-l br2-ns br--right-ns'
							src='/recieve.png'
							style={{ height: "50px", width: "50px" }}
						/>
						{/* <button
							className='f6 f5-l button-reset fl pv3 tc bn bg-animate bg-black-70 hover-bg-green white pointer w-100 w-25-m w-20-l br2-ns br--right-ns'
							type='submit'
							onClick={(event) => this.clickToCall(event)}
							value='Call'>
							Call
						</button> */}
					</div>
				</fieldset>
			) : !this.state.isConnected ? (
				""
			) : (
				// <legend className='pa0 f5 f4-ns mb3 black-80'>Please Configure your provider.</legend>
				""
			);
		return (
			<>
				{!this.state.isConnected ? (
					<div className='pa4-l'>
						<div className='bg-light-green mw7 center pa4 br2-ns ba b--black-10'>
							<fieldset className='cf bn ma0 pa0'>
								<legend className='pa0 f5 f4-ns mb3 black-80'>Configure Your sip.</legend>
								<div className='cf'>
									<label className='clip'>SIP URL</label>
									<input
										className='f6 f5-l input-reset bn fl black-80 bg-white pa3 lh-solid w-100 w-75-m w-100-l br2-ns mb2 br--left-ns'
										placeholder='Extension'
										type='text'
										value={this.state.uri}
										onChange={(event) => this.onChange(event)}
										name='uri'
										id='uri'
									/>
									<input
										className='f6 f5-l input-reset bn fl mr5 black-80 bg-white pa3 lh-solid w-100 w-75-m w-45-l br2-ns br--left-ns pa2'
										placeholder='Enter Your Extension'
										type='number'
										value={this.state.username}
										onChange={(event) => this.onChange(event)}
										name='username'
										id='username'
									/>
									<input
										className='f6 f5-l input-reset bn  fl black-80 bg-white pa3 lh-solid w-100 w-75-m w-45-l br2-ns br--left-ns pa2'
										placeholder='Enter your Password'
										type='password'
										value={this.state.password}
										name='password'
										onChange={(event) => this.onChange(event)}
										id='password'
									/>
									<button
										className='f6 f5-l button-reset mt2 fl pv3 tc bn bg-animate bg-black-70 hover-bg-green white pointer w-100 w-25-m w-100-l br2-ns br--right-ns'
										onClick={(event) => this.connectToSip(event)}
										value='Click to Configure'>
										Click to Configure
									</button>
								</div>
							</fieldset>
						</div>
					</div>
				) : (
					<div className='pa4-l'>
						<div className='bg-light-green mw7 center pa4 br2-ns ba b--black-10'>
							<fieldset className='cf bn ma0 pa0'>{this.state.username} Connected</fieldset>
						</div>
					</div>
				)}
				{/* this.session && this.session.remote_identity */}
				<div className='pa4-l'>
					<div className=' mw7 center pa4 br2-ns  '>
						{incomingCall}
						{callingComp}
						{onCallComp}
						{/* <Dialer /> */}
					</div>
				</div>
			</>
		);
	}
}
