const DJ_TURNTABLE = {
  tempoRange: 20,
  jogSpeed: 5,
  DJtimeFactor: 0.1,

  song1: new Audio('/node/9025/data/audio/push.mp3'),
  song2: new Audio('/node/9025/data/audio/ragga.mp3'),

  leftSong: null,
  rightSong: null,
  channel2load: '',

  modVolumeLeft: 0,
  modVolumeRight: 0,

  rateLeft: 1,
  rateRight: 1,

  left_play: $('#left .play'),
  left_volume: $('#left .volume'),
  left_jog: $('#left .jog'),
  left_load: $('#left .load'),
  left_tempo: $('#left .tempo'),
  left_song: $('#left .song'),
  left_less: $('#left .less'),
  left_more: $('#left .more'),
  left_sync: $('#left .sync'),
  left_input: $('#left input'),
  left_info: $('#left .info'),
  left_infotime: $('#left .info-time'),
  left_infotempo: $('#left .info-tempo > strong'),

  crossfade: $('#crossfade'),
  songloader: $('#songloader'),

  right_play: $('#right .play'),
  right_volume: $('#right .volume'),
  right_jog: $('#right .jog'),
  right_load: $('#right .load'),
  right_tempo: $('#right .tempo'),
  right_song: $('#right .song'),
  right_less: $('#right .less'),
  right_more: $('#right .more'),
  right_sync: $('#right .sync'),
  right_input: $('#right input'),
  right_info: $('#right .info'),
  right_infotime: $('#right .info-time'),
  right_infotempo: $('#right .info-tempo > strong'),

  dragTempo: side => {
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
  },

  dragLeftTempo: () => dragTempo('left'),

  dragRightTempo: () => dragTempo('right'),

  dragVolume: side => {
    if (side === 'left') {
      diff = ((left_volume.offset().top - 482) * -0.5) / 54
      leftSong.volume = ((diff + 0.5) - (modVolumeLeft * (diff + 0.5) / 100)).toFixed(2)
    }
    else if (side === 'right') {
      diff = ((right_volume.offset().top - 482) * -0.5) / 54
      rightSong.volume = ((diff + 0.5) - (modVolumeRight * (diff + 0.5) / 100)).toFixed(2)
    }
  },

  dragLeftVolume: () => { if (leftSong !== null) dragVolume('left') },

  dragRightVolume: () => { if (rightSong !== null) dragVolume('right') },

  crossFade: () => {
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
  },

  marqueeLeftStart: () => {
    left_song.css('left', '100%')
    left_song.animate({ 'left': (0 - left_song.width()) }, 5000, 'linear', marqueeLeftStart)
  },

  marqueeRightStart: () => {
    right_song.css('left', '100%')
    right_song.animate({ 'left': (0 - right_song.width()) }, 5000, 'linear', marqueeRightStart)
  },

  marqueeLeftStop: () => {
    right_song.stop()
    right_song.animate({ 'left': '0' })
  },

  marqueeRightStop: () => {
    right_song.stop()
    right_song.animate({ 'left': '0' })
  },

  setSong: id => {
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
  },

  updateLeftTime: () => {
    leftSong.playbackRate = rateLeft
    left_infotime.html(getTime(leftSong.currentTime))
    left_input.attr('max', leftSong.duration.toFixed(0))
    left_input.val(leftSong.currentTime.toFixed(0))
  },

  updateRightTime: () => {
    rightSong.playbackRate = rateRight
    right_infotime.html(getTime(rightSong.currentTime))
    right_input.attr('max', rightSong.duration.toFixed(0))
    right_input.val(rightSong.currentTime.toFixed(0))
  },

  requestSong: () => alert('There is no song loaded!'),

  askToPause: () => alert('Pause the current song before loading another one!'),

  toggleLoader: deck => {
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
  },

  getTime: seconds => {
    let hr = Math.floor(seconds / 3600)
    let min = Math.floor((seconds - (hr * 3600)) / 60)
    let sec = Math.floor(seconds - (hr * 3600) - (min * 60))

    if (min < 10) min = '0' + min
    if (sec < 10) sec = '0' + sec

    return min + ':' + sec
  }
}

DJ_TURNTABLE.left_play.click(() => {
  if (DJ_TURNTABLE.leftSong !== null) {
    diff = ((DJ_TURNTABLE.left_volume.offset().top - 482) * -0.5) / 54
    currentVolLeft = (0.5 + diff) - (DJ_TURNTABLE.modVolumeLeft * (0.5 + diff) / 100)
    DJ_TURNTABLE.leftSong.volume = currentVolLeft.toFixed(2)
    DJ_TURNTABLE.leftSong.playbackRate = rateLeft

    if (DJ_TURNTABLE.left_jog.hasClass('paused')) {
      DJ_TURNTABLE.left_jog.removeClass('paused')
      DJ_TURNTABLE.left_jog.addClass('running')
      DJ_TURNTABLE.marqueeLeftStart()
      DJ_TURNTABLE.leftSong.play()
    }
    else {
      DJ_TURNTABLE.left_jog.removeClass('running')
      DJ_TURNTABLE.left_jog.addClass('paused')
      DJ_TURNTABLE.marqueeLeftStop()
      DJ_TURNTABLE.leftSong.pause()
    }
  }
  else DJ_TURNTABLE.requestSong()
})

DJ_TURNTABLE.right_play.click(() => {
  if (DJ_TURNTABLE.rightSong !== null) {
    diff = ((DJ_TURNTABLE.right_volume.offset().top - 482) * -0.5) / 54
    currentVolRight = (0.5 + diff) - (DJ_TURNTABLE.modVolumeRight * (0.5 + diff) / 100)
    DJ_TURNTABLE.leftSong.volume = currentVolLeft.toFixed(2)
    DJ_TURNTABLE.leftSong.playbackRate = DJ_TURNTABLE.rateRight

    if (DJ_TURNTABLE.right_jog.hasClass('paused')) {
      DJ_TURNTABLE.right_jog.removeClass('paused')
      DJ_TURNTABLE.right_jog.addClass('running')
      DJ_TURNTABLE.marqueeRightStart()
      DJ_TURNTABLE.rightSong.play()
    }
    else {
      DJ_TURNTABLE.right_jog.removeClass('running')
      DJ_TURNTABLE.right_jog.addClass('paused')
      DJ_TURNTABLE.marqueeRightStop()
      DJ_TURNTABLE.rightSong.pause()
    }
  }
  else DJ_TURNTABLE.requestSong()
})

DJ_TURNTABLE.left_load.click(() => {
  if (DJ_TURNTABLE.left_jog.hasClass('paused')) DJ_TURNTABLE.toggleLoader('left')
  else DJ_TURNTABLE.askToPause()
}),

DJ_TURNTABLE.right_load.click(() => {
  if (DJ_TURNTABLE.right_jog.hasClass('paused')) DJ_TURNTABLE.toggleLoader('right')
  else DJ_TURNTABLE.askToPause()
}),

DJ_TURNTABLE.left_tempo.dblclick(() => {
  DJ_TURNTABLE.left_tempo.animate({ 'top': 91 }, 500, 'easeOutQuad')
  DJ_TURNTABLE.left_infotempo.html('±0.00<span> %</span>')
  DJ_TURNTABLE.rateLeft = 1
}),

DJ_TURNTABLE.right_tempo.dblclick(() => {
  DJ_TURNTABLE.right_tempo.animate({ 'top': 91 }, 500, 'easeOutQuad')
  DJ_TURNTABLE.right_infotempo.html('±0.00<span> %</span>')
  DJ_TURNTABLE.rateRight = 1
}),

DJ_TURNTABLE.left_less.click(() => {
  if (DJ_TURNTABLE.leftSong !== null) DJ_TURNTABLE.leftSong.currentTime -= DJ_TURNTABLE.DJtimeFactor
  else DJ_TURNTABLE.requestSong()
})

DJ_TURNTABLE.left_more.click(() => {
  if (DJ_TURNTABLE.leftSong !== null) DJ_TURNTABLE.leftSong.currentTime += DJ_TURNTABLE.DJtimeFactor
  else DJ_TURNTABLE.requestSong()
})

DJ_TURNTABLE.right_less.click(() => {
  if (DJ_TURNTABLE.rightSong !== null) DJ_TURNTABLE.rightSong.currentTime -= DJ_TURNTABLE.DJtimeFactor
  else DJ_TURNTABLE.requestSong()
})

DJ_TURNTABLE.right_more.click(() => {
  if (DJ_TURNTABLE.rightSong !== null) DJ_TURNTABLE.rightSong.currentTime += DJ_TURNTABLE.DJtimeFactor
  else DJ_TURNTABLE.requestSong()
})

DJ_TURNTABLE.left_input.change(() => { if (DJ_TURNTABLE.leftSong !== null) DJ_TURNTABLE.leftSong.currentTime = this.val() })

DJ_TURNTABLE.right_input.change(() => { if (DJ_TURNTABLE.rightSong !== null) DJ_TURNTABLE.rightSong.currentTime = this.val() })

DJ_TURNTABLE.left_sync.click(() => alert('Left sync clicked!'))

DJ_TURNTABLE.right_sync.click(() => alert('Right sync clicked!'))

DJ_TURNTABLE.left_tempo.draggable({
  drag: DJ_TURNTABLE.dragLeftTempo,
  axis: 'y',
  containment: [35, 187, 35, 294]
})

DJ_TURNTABLE.right_tempo.draggable({
  drag: DJ_TURNTABLE.dragRightTempo,
  axis: 'y',
  containment: [818, 187, 818, 294]
})

DJ_TURNTABLE.left_volume.draggable({
  drag: DJ_TURNTABLE.dragLeftVolume,
  axis: 'y',
  containment: [389, 428, 389, 536]
})

DJ_TURNTABLE.right_volume.draggable({
  drag: DJ_TURNTABLE.dragRightVolume,
  axis: 'y',
  containment: [465, 428, 465, 536]
})

DJ_TURNTABLE.crossfade.draggable({
  drag: DJ_TURNTABLE.crossFade,
  axis: 'x',
  containment: 'parent'
})
