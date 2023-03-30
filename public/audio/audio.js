const tempoRange = 20
const jogSpeed = 5
const timeFactor = 0.1

const song1 = new Audio('./push.mp3')
const song2 = new Audio('./ragga.mp3')

let leftSong = null
let rightSong = null
let channel2load = ''

let modVolumeLeft = 0
let modVolumeRight = 0

let rateLeft = 1
let rateRight = 1

const left_play = $('#left .play')
const left_volume = $('#left .volume')
const left_jog = $('#left .jog')
const left_load = $('#left .load')
const left_tempo = $('#left .tempo')
const left_song = $('#left .song')
const left_less = $('#left .less')
const left_more = $('#left .more')
const left_sync = $('#left .sync')
const left_input = $('#left input')
const left_info = $('#left .info')
const left_infotime = $('#left .info-time')
const left_infotempo = $('#left .info-tempo > strong')

const crossfade = $('#crossfade')
const songloader = $('#songloader')

const right_play = $('#right .play')
const right_volume = $('#right .volume')
const right_jog = $('#right .jog')
const right_load = $('#right .load')
const right_tempo = $('#right .tempo')
const right_song = $('#right .song')
const right_less = $('#right .less')
const right_more = $('#right .more')
const right_sync = $('#right .sync')
const right_input = $('#right input')
const right_info = $('#right .info')
const right_infotime = $('#right .info-time')
const right_infotempo = $('#right .info-tempo > strong')



left_play.click(() => {
  if (leftSong !== null) {
    diff = ((left_volume.offset().top - 482) * -0.5) / 54
    currentVolLeft = (0.5 + diff) - (modVolumeLeft * (0.5 + diff) / 100)
    leftSong.volume = currentVolLeft.toFixed(2)
    leftSong.playbackRate = rateLeft

    if (left_jog.hasClass('paused')) {
      left_jog.removeClass('paused')
      left_jog.addClass('running')
      marqueeLeftStart()
      leftSong.play()
    }
    else {
      left_jog.removeClass('running')
      left_jog.addClass('paused')
      marqueeLeftStop()
      leftSong.pause()
    }
  }
  else requestSong()
})

right_play.click(() => {
  if (rightSong !== null) {
    diff = ((right_volume.offset().top - 482) * -0.5) / 54
    currentVolRight = (0.5 + diff) - (modVolumeRight * (0.5 + diff) / 100)
    leftSong.volume = currentVolLeft.toFixed(2)
    leftSong.playbackRate = rateRight

    if (right_jog.hasClass('paused')) {
      right_jog.removeClass('paused')
      right_jog.addClass('running')
      marqueeRightStart()
      rightSong.play()
    }
    else {
      right_jog.removeClass('running')
      right_jog.addClass('paused')
      marqueeRightStop()
      rightSong.pause()
    }
  }
  else requestSong()
})

left_load.click(() => {
  if (left_jog.hasClass('paused')) toggleLoader('left')
  else askToPause()
})

right_load.click(() => {
  if (right_jog.hasClass('paused')) toggleLoader('right')
  else askToPause()
})

left_tempo.dblclick(() => {
  left_tempo.animate({ 'top': 91 }, 500, 'easeOutQuad')
  left_infotempo.html('±0.00<span> %</span>')
  rateLeft = 1
})

right_tempo.dblclick(() => {
  right_tempo.animate({ 'top': 91 }, 500, 'easeOutQuad')
  right_infotempo.html('±0.00<span> %</span>')
  rateRight = 1
})

const dragTempo = side => {
  if (side === 'left') {
    val = ((left_tempo.offset().top - 240.5) * tempoRange / 53.5).toFixed(2)
    left_jog.css('animation-duration', jogSpeed - ((jogSpeed * val / 100)) + 's')
    if (val > 0) val = '+' + val
    left_infotempo.html(val + '<span> %</span>')
    rateLeft = (1 + (val / 100)).toFixed(2)
  }
  else if (side === 'right') {
    val = ((right_tempo.offset().top - 240.5) * tempoRange / 53.5).toFixed(2)
    right_jog.css('animation-duration', jogSpeed - ((jogSpeed * val / 100)) + 's')
    if (val > 0) val = '+' + val
    right_infotempo.html(val + '<span> %</span>')
    rateRight = (1 + (val / 100)).toFixed(2)
  }
}

const dragLeftTempo = () => dragTempo('left')

left_tempo.draggable({
  drag: dragLeftTempo,
  axis: 'y',
  containment: [35, 187, 35, 294]
})

const dragRightTempo = () => dragTempo('right')

right_tempo.draggable({
  drag: dragRightTempo,
  axis: 'y',
  containment: [818, 187, 818, 294]
})

const dragVolume = side => {
  if (side === 'left') {
    diff = ((left_volume.offset().top - 482) * -0.5) / 54
    leftSong.volume = ((diff + 0.5) - (modVolumeLeft * (diff + 0.5) / 100)).toFixed(2)
  }
  else if (side === 'right') {
    diff = ((right_volume.offset().top - 482) * -0.5) / 54
    rightSong.volume = ((diff + 0.5) - (modVolumeRight * (diff + 0.5) / 100)).toFixed(2)
  }
}

const dragLeftVolume = () => { if (leftSong !== null) dragVolume('left') }

left_volume.draggable({
  drag: dragLeftVolume,
  axis: 'y',
  containment: [389, 428, 389, 536]
})

const dragRightVolume = () => { if (rightSong !== null) dragVolume('right') }

right_volume.draggable({
  drag: dragRightVolume,
  axis: 'y',
  containment: [465, 428, 465, 536]
})

const crossFade = () => {
  currentVolLeft = (0.5 + ((left_volume.offset().top - 482) * -0.5) / 54).toFixed(2)
  currentVolRight = (0.5 + ((right_volume.offset().top - 482) * -0.5) / 54).toFixed(2)
  if (crossfade.position().left - 57 < 0) {
    modVolumeLeft = 0
    modVolumeRight = ((crossfade.position().left - 57) * 100 / -57).toFixed(2)
  }
  else if (crossfade.position().left - 57 > 0) {
    modVolumeLeft = ((crossfade.position().left - 57) * 100 / 57).toFixed(2)
    modVolumeRight = 0
  }
  else {
    modVolumeLeft = 0
    modVolumeRight = 0
  }

  if (leftSong !== null) leftSong.volume = currentVolLeft - (modVolumeLeft * currentVolLeft / 100).toFixed(2)
  if (rightSong !== null) rightSong.volume = currentVolRight - (modVolumeRight * currentVolRight / 100).toFixed(2)
}

crossfade.draggable({
  drag: crossFade,
  axis: 'x',
  containment: 'parent'
})

const marqueeLeftStart = () => {
  left_song.css('left', '100%')
  left_song.animate({ 'left': (0 - left_song.width()) }, 5000, 'linear', marqueeLeftStart)
}

const marqueeRightStart = () => {
  right_song.css('left', '100%')
  right_song.animate({ 'left': (0 - right_song.width()) }, 5000, 'linear', marqueeRightStart)
}

const marqueeLeftStop = () => {
  right_song.stop()
  right_song.animate({ 'left': '0' })
}

const marqueeRightStop = () => {
  right_song.stop()
  right_song.animate({ 'left': '0' })
}

left_less.click(() => {
  if (leftSong !== null) leftSong.currentTime -= timeFactor
  else requestSong()
})

left_more.click(() => {
  if (leftSong !== null) leftSong.currentTime += timeFactor
  else requestSong()
})

right_less.click(() => {
  if (rightSong !== null) rightSong.currentTime -= timeFactor
  else requestSong()
})

right_more.click(() => {
  if (rightSong !== null) rightSong.currentTime += timeFactor
  else requestSong()
})


const setSong = id => {
  if (channel2load === 'left') {
    left_infotime.html('00:00')
    left_input.attr('max', 0)
    left_input.val(0)

    switch (id) {
      case 1:
        loader = song1
        left_song.html('A-Trak feat. Andrew Wyatt - Push')
        toggleLoader(channel2load)
        break
      case 2:
        loader = song2
        left_song.html('My Digital Enemy - On A Ragga Tip')
        toggleLoader(channel2load)
        break
    }
    
    leftSong = loader
    leftSong.ontimeupdate = null
    leftSong.ontimeupdate = () => updateLeftTime()
  }
  else if (channel2load === 'right') {
    right_infotime.html('00:00')
    right_input.attr('max', 0)
    right_input.val(0)

    switch (id) {
      case 1:
        loader = song1
        right_song.html('A-Trak feat. Andrew Wyatt - Push')
        toggleLoader(channel2load)
        break
      case 2:
        loader = song2
        right_song.html('My Digital Enemy - On A Ragga Tip')
        toggleLoader(channel2load)
        break
    }

    rightSong = loader
    rightSong.ontimeupdate = null
    rightSong.ontimeupdate = () => updateRightTime()
  }
}

const updateLeftTime = () => {
  leftSong.playbackRate = rateLeft
  left_infotime.html(getTime(leftSong.currentTime))
  left_input.attr('max', leftSong.duration.toFixed(0))
  left_input.val(leftSong.currentTime.toFixed(0))
}

const updateRightTime = () => {
  rightSong.playbackRate = rateRight
  right_infotime.html(getTime(rightSong.currentTime))
  right_input.attr('max', rightSong.duration.toFixed(0))
  right_input.val(rightSong.currentTime.toFixed(0))
}

const requestSong = () => alert('There is no song loaded!')

const askToPause = () => alert('Pause the current song before loading another one!')

const toggleLoader = deck => {
  channel2load = deck
  if (songloader.position().top === 150) {
    songloader.animate({ 'top': 20 }, 600, 'easeOutQuad')
    if (deck === 'left') left_info.css('background-color', '#000033')
    else if (deck === 'right') right_info.css('background-color', '#000033')
  }
  else {
    songloader.animate({ 'top': 150 }, 600, 'easeOutQuad')
    if (deck === 'left') left_info.css('background-color', '#000')
    else if (deck === 'right') right_info.css('background-color', '#000')
  }
}

const getTime = seconds => {
  let hr = Math.floor(seconds / 3600)
  let min = Math.floor((seconds - (hr * 3600)) / 60)
  let sec = Math.floor(seconds - (hr * 3600) - (min * 60))

  if (min < 10) min = '0' + min
  if (sec < 10) sec = '0' + sec

  return min + ':' + sec
}

left_input.change(() => { if (leftSong !== null) leftSong.currentTime = this.val() })

right_input.change(() => { if (rightSong !== null) rightSong.currentTime = this.val() })

left_sync.click(() => alert('Left sync clicked!'))

right_sync.click(() => alert('Right sync clicked!'))
