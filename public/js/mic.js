const configuration = {
  iceServers: [{
    'urls': [
      'stun:stun.l.google.com:19302',
      'stun:stun1.l.google.com:19302',
      'stun:stun2.l.google.com:19302'
    ]
  }]
}

const peerConnection = new RTCPeerConnection(configuration)
let stream = null

const toggleMic = stream => {
  if (stream.getAudioTracks()[0].enabled) {
    stream.getAudioTracks()[0].enabled = false
    document.getElementById('mic-icon').classList.remove('fa-microphone')
    document.getElementById('mic-icon').classList.add('fa-microphone-slash')
  }
  else {
    stream.getAudioTracks()[0].enabled = true
    document.getElementById('mic-icon').classList.remove('fa-microphone-slash')
    document.getElementById('mic-icon').classList.add('fa-microphone')
  }

  console.log(stream.getAudioTracks()[0])
}

/*
const sendData = data => {
  data.username = username
  websocket.send(JSON.stringify(data))
}
*/

const createAndSendOffer = () => {
  peerConnection.createOffer(offer => {
    /*
    sendData({
      type: 'store_offer',
      offer: offer
    })
    */
    peerConnection.setLocalDescription(offer)
  })
}

const clickMicButton = async () => {
  if (stream === null) {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
    document.getElementById('mic-icon').classList.remove('fa-microphone-slash')
    document.getElementById('mic-icon').classList.add('fa-microphone')
    console.log(stream)
    peerConnection.addStream(stream)
    peerConnection.onicecandidate = event => {
      if (event.candidate === null) return
      /*
      sendData({
        type: 'store_candidate',
        candidate: event.candidate
      })
      */
    }
  }
  else toggleMic(stream)
}
