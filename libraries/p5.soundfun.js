
// SoundFun is an oscillator controlled by a user provided function

(function() {

  // get the master
  var p5sound =  p5.soundOut;

  p5.SoundFun = function(fn, freq){

    // call parent constructor
    p5.Oscillator.call(this);

    // delete superflous attributes
    delete this.f;
    delete this.freq;

    // wrap the function into an array
    var fns = (fn.constructor === Array) ? fn : [fn];

    // number of channels
    channels = fns.length;

    // get sample rate
    var rate =  p5sound.audiocontext.sampleRate;

    // buffer needs to be twice as big as the samplerate
    var n = 2 * rate;

    // create a new buffer to hold the values we compute
    this.buffer = p5sound.audiocontext.createBuffer(channels, n, rate);

    // fill the data array of each channel
    // with the values computed from the functions
    for(var c = 0; c < channels; c++) {
      var data = this.buffer.getChannelData(c);
      var channelfn = fns[c];
      for (var i = 0; i < n; i++) {
        var phase =  i/n * TWO_PI;
        data[i] = channelfn(phase * freq * 2);
      }
    }

  };

  p5.SoundFun.prototype = Object.create(p5.Oscillator.prototype);


  p5.SoundFun.prototype.start = function() {

    // stop if the oscillator is already running
    if (this.started){
      this.stop();
    }

    // create a buffer source and assign the precomputed buffer
    this.osci = p5sound.audiocontext.createBufferSource();
    this.osci.buffer = this.buffer;
    this.osci.loop = true;
    this.osci.connect(this.output);

    // start the oscillator
    var now = p5sound.audiocontext.currentTime;
    this.osci.start(now);
    this.started = true;

  };


  p5.SoundFun.prototype.stop  = function() {

    // stop the oscillator
    var now = p5sound.audiocontext.currentTime;
    if (this.osci) {
      this.osci.stop(now);
      this.started = false;
    }

  };


  p5.SoundFun.prototype.dispose = function(){

    // remove reference from soundArray
    var index = p5sound.soundArray.indexOf(this);
    p5sound.soundArray.splice(index, 1);

    // disconnect and stop everything
    if (this.osci) {
      this.osci.disconnect();
      var now = p5sound.audiocontext.currentTime;
      this.stop(now);
    }
    if (this.output) {
      this.output.disconnect();
    }
    if (this.panner) {
      this.panner.disconnect();
    }

    // remove all references
    this.output = null;
    this.panner = null;
    this.buffer = null;
    this.osci = null;

  };

})();
