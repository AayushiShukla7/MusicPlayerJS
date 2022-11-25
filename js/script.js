const wrapper = document.querySelector(".wrapper"),
canvas = wrapper.querySelector(".img-area canvas"),
musicName = wrapper.querySelector(".song-details .name"),
musicArtist = wrapper.querySelector(".song-details .artist"),
playPauseBtn = wrapper.querySelector(".play-pause"),
prevBtn = wrapper.querySelector("#prev"),
nextBtn = wrapper.querySelector("#next"),
mainAudio = wrapper.querySelector("#main-audio"),
progressArea = wrapper.querySelector(".progress-area"),
progressBar = progressArea.querySelector(".progress-bar"),
musicList = wrapper.querySelector(".music-list"),
moreMusicBtn = wrapper.querySelector("#more-music"),
closemoreMusic = musicList.querySelector("#close"),
volumeSlider = wrapper.querySelector("#np-volume");
animationDropdown = wrapper.querySelector("#animation-dropdown");

//Animation Dropdown Options
const animationOptions = ["--Select Animation--", "Sound Bars", "Circle with Bars", "Leaf with Arc", "Origami Fan", "Bubbles", "Spiraling Images", "Neon Bars", "Psychedellic Blue", "Groovy Liquid", "Alphabet Soup", "Outward Spiral", "Colorful Pencil Shavings"];

let isPaused = true;
let isPlaying = false;

let audioContext;
let audioSource;
let analyzer;

//#region Animations - SETUP

//Set canvas width and height
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

//2D or WebGL APIs could be used here.
const ctx = canvas.getContext('2d');

//Give lines round endings 
ctx.lineCap = 'round';

const rndInt = randomNumber(12);
let styleChoice = rndInt.toString();
let analyzerFFTValue = 128; 
let myVolume = 0.5; 

// //Dropdown options creation
// const select = document.getElementById('animation-dropdown')
// animationOptions.forEach(value => {
//   const option = document.createElement('option');
//   option.innerHTML = value;
//   select.appendChild(option);
// });

//#endregion Animations - SETUP

//#region Custom dropdown - SETUP

// customSelect.addEventListener('click', function() {
//   myFunction();
// });

/* When the user clicks on the button, 
toggle between hiding and showing the dropdown content */
function myFunction() {
  document.getElementById("animation-dropdown").classList.toggle("show");
}

// Close the dropdown if the user clicks outside of it
window.onclick = function(event) {
  if (!event.target.matches('.dropbtn')) {
    var dropdowns = document.getElementsByClassName("dropdown-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
}

const setAnimationStyle = (val) =>{
  if(val > 0) {
      pauseMusic();
      styleChoice = val;
      playMusic();
  }
};

//#endregion Custom dropdown- SETUP

let musicIndex = Math.floor((Math.random() * allMusic.length) + 1);
isMusicPaused = true;

window.addEventListener("load", ()=>{
  loadMusic(musicIndex);
  playingSong(); 
});

//volume slider
var output = document.getElementById("volume-value");
output.innerHTML = volumeSlider.value;

//volume control - Slider
function setVolume(myVolume) {
  mainAudio.volume = myVolume;
}

volumeSlider.addEventListener("input", function(e) {
  output.innerHTML = e.currentTarget.value;
  mainAudio.volume = e.currentTarget.value / 100;
});

//volume up/down with arrow keys function
document.onkeydown = function(event) {
  switch (parseInt(event.key)) {
     case 38:
          event.preventDefault();
          audio_vol = mainAudio.volume;
          if (audio_vol!=1) {
            try {
                mainAudio.volume = audio_vol + 0.02;
            }
            catch(err) {
                mainAudio.volume = 1;
            }              
          }            
        break;
     case 40:
          event.preventDefault();
          audio_vol = mainAudio.volume;
          if (audio_vol!=0) {
            try {
                mainAudio.volume = audio_vol - 0.02;
            }
            catch(err) {
                mainAudio.volume = 0;
            }              
          }            
        break;
  }
};

//#region  Helper Functions

//random number calculation function
function randomNumber(maxVal) {
  return Math.floor(Math.random() * maxVal) + 1;
}

//random color function
function fetchRandomColor() {
  let maxVal = 0xFFFFFF; // 16777215
  let randomNumber = Math.random() * maxVal; 
  randomNumber = Math.floor(randomNumber);
  randomNumber = randomNumber.toString(16);
  let randColor = randomNumber.padStart(6, 0);   
  return `#${randColor.toUpperCase()}`
}

//#endregion  Helper Functions

//Music pause/play toggle on canvas click event
canvas.addEventListener('click', function(){ 
  if(isPaused && !isPlaying) {
    playMusic();
  }
  else {
    pauseMusic();
  }
});

//canvas fullscreen on double-click event
canvas.addEventListener('dblclick', function(){ 
  if(canvas.requestFullscreen) {
    canvas.requestFullscreen();
  }
  else if (canvas.webkitRequestFullscreen) { /* Safari */
    canvas.webkitRequestFullscreen();
  } 
  else if (canvas.msRequestFullscreen) { /* IE11 */
    canvas.msRequestFullscreen();
  }
});

function loadMusic(indexNumb){
  musicName.innerText = allMusic[indexNumb - 1].name;
  musicArtist.innerText = allMusic[indexNumb - 1].artist;
  styleChoice = randomNumber(12).toString();
  mainAudio.src = `songs/${allMusic[indexNumb - 1].src}.mp3`;
}

//Set Bar Width and Analyzer FFT for visualizer
function setBarWidthAndFFT(barWidth, fft) {
  barWidthValue = barWidth;
  analyzerFFTValue = fft;
}

//play music function
function playMusic(){
  //Reset canvas for redraw
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  isPlaying = true;
  isPaused = false;

  wrapper.classList.add("paused");
  playPauseBtn.querySelector("i").innerText = "pause";
  
  //setVolume(myVolume);

  //Randomize animation style and update dropdown
  styleChoice = randomNumber(11);
  console.log("Animation = " + animationOptions[styleChoice]);
  animationDropdown.value = styleChoice;

  mainAudio.play();

  //Animations
  audioContext = new window.AudioContext(); 

  if(!audioSource) {
    audioSource = audioContext.createMediaElementSource(mainAudio);
    analyzer = audioContext.createAnalyser();
    audioSource.connect(analyzer);
    analyzer.connect(audioContext.destination);
  }

  //Analyzer bars drawn on canvas (default is 2048)
  //Analyser fftSize Values: 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768
  const fftSizeArray = [32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768];
  let randomFFTIndex = randomNumber(fftSizeArray.length) - 1;
  analyzer.fftSize = fftSizeArray[randomFFTIndex]; // 128; 
  console.log("analyzer.fftSize = "+ analyzer.fftSize);

  //ReadOnly (half of fftSize)
  const bufferLength = analyzer.frequencyBinCount;    
  
  const dataArray = new Uint8Array(bufferLength);

  //Start drawing
  const barWidth = 15;
  let barHeight;
  let x;

  function animate() {
      x = 0;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      analyzer.getByteFrequencyData(dataArray);   //0 to 256

      drawVisualizer(styleChoice, bufferLength, x, barWidth, barHeight, dataArray);  //Reusable method
      requestAnimationFrame(animate);
  }

  animate();
}

//music visualizer function
function drawVisualizer(choice, bufferLength, x, barWidth, barHeight, dataArray) {
   switch(choice) {
      case '1': //Animation #1: Waves back-to-back
      barWidth = 30;
      analyzer.fftSize = 256;

      //Creates 32 soundbars
      for(let i = 0; i< bufferLength; i++) {
          barHeight = dataArray[i] * 2;

          //Dynamically change colors based on the frequency
          const red = i * barHeight/10;
          const green = i * 4;
          const blue = barHeight/2;

          ctx.fillStyle = 'rgb(' + red + ',' + green + ',' + blue + ')';
          ctx.fillRect(canvas.width - x, canvas.height - barHeight, barWidth, barHeight);
          x += barWidth;
      }

      //Draws second set of bars beside the first one
      for(let i = 0; i< bufferLength; i++) {
          barHeight = dataArray[i] * 2;

          //Dynamically change colors based on the frequency
          const red = i * barHeight/10;
          const green = i * 4;
          const blue = barHeight/2;

          ctx.fillStyle = 'rgb(' + red + ',' + green + ',' + blue + ')';
          ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
          x += barWidth;
      }

      //IMPORTANT - To restore the canvas after rotation
      ctx.restore();
      break;
      
      case '2': //Animation #2: Circle
      analyzer.fftSize = 128;

      //Draws second set of bars beside the first one
      for(let i = 0; i< bufferLength; i++) {
          barHeight = dataArray[i] * 1.5;

          //Draw a circle animation
          ctx.save();
          ctx.translate(canvas.width/2, canvas.height/2); //Sets rotate center point for rotation
          ctx.rotate(i * Math.PI * 10 / bufferLength);

          //Dynamically change colors based on the frequency
          const hue = i * 1.5;  //Angle from Red(0)

          //ctx.fillStyle = 'hsl(' + hue + ',100%, 50%)';
          ctx.fillStyle = 'hsl(' + hue + ',100%,' + barHeight/4 +'%)';
          ctx.fillRect(0, 0, barWidth, barHeight);
          x += barWidth;

          //IMPORTANT - To restore the canvas after rotation
          ctx.restore();
      }

      //IMPORTANT - To restore the canvas after rotation
      ctx.restore();
      break;

      case '3': //Animation #3: Leaf effect with arc
      analyzer.fftSize = 1024;

      //Draws a leaf effect by adjusting rotations and arc
      for(let i = 0; i< bufferLength; i++) {
          barHeight = dataArray[i] * 1.5;

          //Draw a circle animation
          ctx.save();
          ctx.translate(canvas.width/2, canvas.height/2); //Sets rotate center point for rotation
          ctx.rotate(i * 4.182);   //Increase or decrease value to change rotation of canvas

          //Dynamically change colors based on the frequency
          const hue = 120 + i * 0.05;  //Angle from Red(0)

          //ctx.fillStyle = 'hsl(' + hue + ',100%, 50%)';
          //Dynamic lighting
          ctx.fillStyle = 'hsl(' + hue + ',100%,' + barHeight/4 +'%)';

          //Draw a circle by using arc()
          ctx.beginPath();
          ctx.arc(50, barHeight/2, barHeight/2, 0, Math.PI/2);
          ctx.fill();
          ctx.stroke();

          ctx.fillRect(0, 0, barWidth, barHeight);
          x += barWidth;

          //IMPORTANT - To restore the canvas after rotation
          ctx.restore();
      }
      break;

      case '4': //Animation #4: Origami Fan
      analyzer.fftSize = 64;

      for(let i = 0; i< bufferLength; i++) {
          barHeight = dataArray[i] * 1.4;

          //Draw a circle animation
          ctx.save();
          ctx.translate(canvas.width/2, canvas.height/2); //Sets rotate center point for rotation
          ctx.rotate(i * bufferLength * 4);   //Increase or decrease value to change rotation of canvas

          //Dynamically change colors based on the frequency - Angle from Red(0)
          const hue = i * 0.3;    //250 + i * 2;  

          //ctx.fillStyle = 'hsl(' + hue + ',100%, 50%)';
          //Dynamic lighting
          ctx.fillStyle = 'hsl(' + hue + ',100%,' + barHeight/3 +'%)';

          ctx.fillRect(0, 0, barWidth, barHeight);
          x += barWidth;

          //IMPORTANT - To restore the canvas after rotation
          ctx.restore();
      }
      break;

      case '5': //Animation #5: Spirals and circles (Bubbles)
      analyzer.fftSize = 256;

      for(let i = 0; i< bufferLength; i++) {
          barHeight = dataArray[i] * 1.4;

          //Draw a circle animation
          ctx.save();

          //Sets rotate center point for rotation
          ctx.translate(canvas.width/2, canvas.height/2); 

          //Increase or decrease value to change rotation of canvas
          //ctx.rotate(i * bufferLength * 4);   
          //ctx.rotate(i * bufferLength * -4);  
          //ctx.rotate(i * bufferLength * -0.4);  
          //ctx.rotate(i * bufferLength * -5.001);  
          //ctx.rotate(i * bufferLength * -4.005);  
          ctx.rotate(i * bufferLength * -3.009);  

          //Dynamically change colors based on the frequency
          const hue = 250 + i * 2;  //Angle from Red(0)

          ctx.fillStyle = 'hsl(' + hue + ',100%, 50%)';
          //Dynamic lighting
          //ctx.fillStyle = 'hsl(' + hue + ',100%,' + barHeight/3 +'%)';

          //Draw circle #1
          ctx.beginPath();
          ctx.arc(0, barHeight, barHeight/10, 0, Math.PI * 2);

          //Draw circle #2
          ctx.arc(0, barHeight/1.5, barHeight/20, 0, Math.PI * 2);

          //Draw circle #3
          ctx.arc(0, barHeight/2, barHeight/30, 0, Math.PI * 2);

          //Draw circle #4
          ctx.arc(0, barHeight/3, barHeight/40, 0, Math.PI * 2);
          ctx.fill();

          x += barWidth;

          //IMPORTANT - To restore the canvas after rotation
          ctx.restore();
      }
      break;

      case '6': //Animation #6: Images/sprite sheets with drawImage method
      analyzer.fftSize = 128;

      let randomImageNumber = randomNumber(5).toString();
      const sprite = new Image();
      sprite.src = './images/Image' + randomImageNumber + '.jfif'; 

      for(let i = 0; i< bufferLength; i++) {
          barHeight = dataArray[i] * 1.5;           

          //Draw a circle animation
          ctx.save();

          //Sets rotate center point for rotation
          ctx.translate(canvas.width/2, canvas.height/2); 

          //Increase or decrease value to change rotation of canvas
          ctx.rotate(i * -2.9);  

          ctx.drawImage(sprite, 0, barHeight, barHeight/2.5, barHeight/2.5);
          x += barWidth;
          ctx.restore();
      }

      let size = dataArray[15] * 1.5 > 100 ? dataArray[15] : 100;
      ctx.drawImage(sprite, canvas.width - size/2, canvas.height - size/2, size, size);

      //IMPORTANT - To restore the canvas after rotation
      ctx.restore();
      break;

      case '7': //Animation #7: Neon bars with globalCompositeOperation
      analyzer.fftSize = 128;

      for(let i = 0; i< bufferLength; i++) {
          barHeight = dataArray[i] * 1.2;

          ctx.shadowOffsetX = 0;  //2;
          ctx.shadowOffsetY = 0;  //5;
          ctx.shadowBlur = 20;
          ctx.shadowColor = 'white';

          ctx.globalCompositeOperation = 'source-over';   //Glowing neon edges only

          //Draw a circle animation
          ctx.save();

          //Sets rotate center point for rotation
          ctx.translate(canvas.width/2, canvas.height/2); 

          //Increase or decrease value to change rotation of canvas
          ctx.rotate(i * bufferLength / 1.2);   
          ctx.lineWidth = barHeight/7;

          //Dynamically change colors based on the frequency - Angle from Red(0)
          const hue = 200 + i * 5;    

          //Static lighting
          ctx.strokeStyle = 'hsl(' + hue + ',100%, 50%)';
          //Dynamic lighting
          //ctx.strokeStyle = 'hsl(' + hue + ',100%,' + barHeight/3 +'%)';

          //Draw a line
          ctx.beginPath();
          ctx.moveTo(0, barHeight/1.1);
          ctx.lineTo(barHeight/1.1, barHeight);
          ctx.stroke();
          //ctx.fillRect(0, 0, barWidth, barHeight);
          x += barWidth * 1.5;
          ctx.restore();
      }
      
      //IMPORTANT - To restore the canvas after rotation
      ctx.shadowBlur = 0;
      ctx.shadowColor = '';
      ctx.restore();
      break;

      case '8': //Animation #8: Layer Interactions (Psychedellic Blue)
      analyzer.fftSize = 16384;

      //Creates 32 soundbars
      for(let i = 0; i< bufferLength; i++) {
          barHeight = dataArray[i] * 1.1;

          ctx.globalCompositeOperation = 'difference';

          ctx.save();
          ctx.translate(canvas.width/2, canvas.height/2);
          ctx.rotate(i * Math.PI * 4 / bufferLength);
          ctx.fillStyle = 'blue';
          ctx.strokeStyle = 'blue';
          ctx.lineWidth = barHeight/12;
          
          //Draw Lines
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(0, barHeight);
          ctx.stroke();

          //Draw Circles #1
          ctx.beginPath();
          ctx.arc(0, barHeight + barHeight/5, barHeight/20, 0, Math.PI * 2);     //arc(x, y, radius, start-angle, end-angle)
          ctx.fill();

          //Draw Circles #2
          ctx.beginPath();
          ctx.arc(0, barHeight + barHeight/2, barHeight/10, 0, Math.PI * 2);     //arc(x, y, radius, start-angle, end-angle)
          ctx.fill();

          x += barWidth;
          ctx.restore();
      }
      
      //IMPORTANT - To restore the canvas after rotation
      ctx.globalCompositeOperation = '';
      ctx.restore();
      break;

      case '9': //Animation #9: Liquid Filter Effect
      analyzer.fftSize = 256;

      ctx.fillStyle = 'yellow'; //fetchRandomColor();   
      canvas.style.background = 'black';
      canvas.style.filter = 'blur(10px) contrast(20)';

      //Creates 32 rectangles
      for(let i = 0; i < bufferLength; i++) {
          barHeight = dataArray[i] * 0.8;
          ctx.save();            
          ctx.translate(canvas.width/2, canvas.height/2); 
          ctx.rotate(i * 1.1);            
          ctx.fillRect(0, 0, -barHeight/2, -barHeight);
          x += barWidth;
          ctx.restore();
      }

      //Creates 15 circles on top of previous shapes
      for(let i = 0; i < 15; i++) {
          barHeight = dataArray[i] * 0.8;
          ctx.save();
          ctx.translate(canvas.width/2, canvas.height/2); 
          ctx.rotate(i * 1.2);            
          ctx.beginPath();
          ctx.arc(0, barHeight * 1.4, barHeight/4, 0, Math.PI * 2);
          ctx.fill();
          x += barWidth;
          ctx.restore();
      }
      
      //IMPORTANT - To restore the canvas after rotation
      ctx.restore();
      break;

      case '10': //Animation #10: Text effects on canvas with fillText
      analyzer.fftSize = 64;

      ctx.fillStyle = 'hotpink';
      ctx.shadowOffsetX = 5;
      ctx.shadowOffsetY = 5;
      ctx.shadowBlur = 0;
      ctx.shadowColor = 'aqua';

      //Draws second set of bars beside the first one
      for(let i = 0; i< bufferLength; i++) {
          barHeight = dataArray[i] * 1.2;
          ctx.save();
          ctx.translate(canvas.width/2, canvas.height/2); 
          ctx.rotate(i * 8.1);
          const hue = i * 3;  //Angle from Red(0)
          ctx.strokeStyle = 'hsl(' + hue + ',100%,' + barHeight/3 +'%)';
          ctx.font = dataArray[i] + 'px Helvetica';
          ctx.fillText('A', 40, barHeight * 1.6);
          ctx.strokeText('A', 40, barHeight * 1.6);
          x += barWidth;
          ctx.restore();
      }

      const fontSize = dataArray[15] * 3;
      ctx.font = fontSize + 'px Helvetica';
      const halfSize = fontSize/2;
      ctx.fillText('A', canvas.width/2 - halfSize/1.5, canvas.height/2 + halfSize/1.5);
      ctx.strokeText('A', canvas.width/2 - halfSize/1.5, canvas.height/2 + halfSize/1.5);

      //IMPORTANT - To restore the canvas after rotation
      ctx.restore();
      break;
      
      case '11': //Animation #11: Outward Spiral
      analyzer.fftSize = 128;

      for(let i = 0; i< bufferLength; i++) {
          barHeight = dataArray[i] * 1.2;
          ctx.save();
          ctx.translate(canvas.width/2, canvas.height/2); 
          ctx.rotate(i * -0.14);
          const hue = i * 5.5;  
          ctx.fillStyle = 'hsl(' + hue + ',100%,' + barHeight/4 +'%)';
          ctx.fillRect(barHeight/3, 0, barWidth, barHeight);
          x += barWidth;
          ctx.restore();
      }

      //IMPORTANT - To restore the canvas after rotation
      ctx.restore();
      break;

      case '12': //Animation #12: Conditional Rectangles (Pencil Shavings)
      analyzer.fftSize = 256;

      for(let i = 0; i< bufferLength; i++) {
          barHeight = dataArray[i] * 0.8;
          ctx.save();
          ctx.translate(canvas.width/2, canvas.height/2); 
          ctx.rotate(i * 0.14);
          const hue = i * 1.5;  
          ctx.fillStyle = 'hsl(' + hue + ',100%,' + barHeight/3 +'%)';
          ctx.strokeStyle = 'white';
          ctx.fillRect(barHeight/2, barHeight/2, barWidth, barHeight);
          
          barHeight > 80 ?  ctx.strokeRect(barHeight/2, barHeight/2, barWidth, barHeight * 1.2) : ctx.strokeRect(0,0,0,0);

          barHeight > 110 ?  ctx.strokeRect(barHeight/2, barHeight * 1.8, barWidth, barHeight * 0.2) : ctx.strokeRect(0,0,0,0);

          x += barWidth;
          ctx.restore();
      }

      //IMPORTANT - To restore the canvas after rotation
      ctx.restore();
      break;

      default: //Animation #1: Waves back-to-back
      //Creates 32 soundbars
      for(let i = 0; i< bufferLength; i++) {
          barHeight = dataArray[i] * 2;

          //Dynamically change colors based on the frequency
          const red = i * barHeight/10;
          const green = i * 4;
          const blue = barHeight/2;

          ctx.fillStyle = 'white';
          ctx.fillRect(canvas.width - x, canvas.height - barHeight - 30, barWidth, 20);
          ctx.fillStyle = 'rgb(' + red + ',' + green + ',' + blue + ')';
          ctx.fillRect(canvas.width - x, canvas.height - barHeight, barWidth, barHeight);
          x += barWidth;
      }

      //Draws second set of bars beside the first one
      for(let i = 0; i< bufferLength; i++) {
          barHeight = dataArray[i] * 2;

          //Dynamically change colors based on the frequency
          const red = i * barHeight/10;
          const green = i * 4;
          const blue = barHeight/2;

          ctx.fillStyle = 'white';
          ctx.fillRect(x, canvas.height - barHeight - 30, barWidth, 15);
          ctx.fillStyle = 'rgb(' + red + ',' + green + ',' + blue + ')';
          ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
          x += barWidth;

          //IMPORTANT - To restore the canvas after rotation
          ctx.restore();
      }

      //IMPORTANT - To restore the canvas after rotation
      ctx.restore();
      break;
  }
}

//pause music function
function pauseMusic(){
  isPlaying = false;
  isPaused = true;

  wrapper.classList.remove("paused");
  playPauseBtn.querySelector("i").innerText = "play_arrow";
  mainAudio.pause();
}

//prev music function
function prevMusic(){
  musicIndex--; //decrement of musicIndex by 1
  //if musicIndex is less than 1 then musicIndex will be the array length so the last music play
  musicIndex < 1 ? musicIndex = allMusic.length : musicIndex = musicIndex;
  loadMusic(musicIndex);
  playMusic();
  playingSong(); 
}

//next music function
function nextMusic(){
  musicIndex++; //increment of musicIndex by 1
  //if musicIndex is greater than array length then musicIndex will be 1 so the first music play
  musicIndex > allMusic.length ? musicIndex = 1 : musicIndex = musicIndex;
  loadMusic(musicIndex);
  playMusic();
  playingSong(); 
}

// play or pause button event
playPauseBtn.addEventListener("click", ()=>{
  const isMusicPlay = wrapper.classList.contains("paused");
  //if isPlayMusic is true then call pauseMusic else call playMusic
  isMusicPlay ? pauseMusic() : playMusic();
  playingSong();
});

//prev music button event
prevBtn.addEventListener("click", ()=>{
  prevMusic();
});

//next music button event
nextBtn.addEventListener("click", ()=>{
  nextMusic();
});

// update progress bar width according to music current time
mainAudio.addEventListener("timeupdate", (e)=>{
  const currentTime = e.target.currentTime; //getting playing song currentTime
  const duration = e.target.duration; //getting playing song total duration
  let progressWidth = (currentTime / duration) * 100;
  progressBar.style.width = `${progressWidth}%`;

  let musicCurrentTime = wrapper.querySelector(".current-time"),
  musicDuartion = wrapper.querySelector(".max-duration");
  mainAudio.addEventListener("loadeddata", ()=>{
    // update song total duration
    let mainAdDuration = mainAudio.duration;
    let totalMin = Math.floor(mainAdDuration / 60);
    let totalSec = Math.floor(mainAdDuration % 60);
    if(totalSec < 10){ //if sec is less than 10 then add 0 before it
      totalSec = `0${totalSec}`;
    }
    musicDuartion.innerText = `${totalMin}:${totalSec}`;
  });
  // update playing song current time
  let currentMin = Math.floor(currentTime / 60);
  let currentSec = Math.floor(currentTime % 60);
  if(currentSec < 10){ //if sec is less than 10 then add 0 before it
    currentSec = `0${currentSec}`;
  }
  musicCurrentTime.innerText = `${currentMin}:${currentSec}`;
});

// update playing song currentTime on according to the progress bar width
progressArea.addEventListener("click", (e)=>{
  let progressWidth = progressArea.clientWidth; //getting width of progress bar
  let clickedOffsetX = e.offsetX; //getting offset x value
  let songDuration = mainAudio.duration; //getting song total duration
  
  mainAudio.currentTime = (clickedOffsetX / progressWidth) * songDuration;
  playMusic(); //calling playMusic function
  playingSong();
});

//change loop, shuffle, repeat icon onclick
const repeatBtn = wrapper.querySelector("#repeat-plist");
repeatBtn.addEventListener("click", ()=>{
  let getText = repeatBtn.innerText; //getting this tag innerText
  switch(getText){
    case "repeat":
      repeatBtn.innerText = "repeat_one";
      repeatBtn.setAttribute("title", "Song looped");
      break;
    case "repeat_one":
      repeatBtn.innerText = "shuffle";
      repeatBtn.setAttribute("title", "Playback shuffled");
      break;
    case "shuffle":
      repeatBtn.innerText = "repeat";
      repeatBtn.setAttribute("title", "Playlist looped");
      break;
  }
});

//code for what to do after song ended
mainAudio.addEventListener("ended", ()=>{
  // we'll do according to the icon means if user has set icon to
  // loop song then we'll repeat the current song and will do accordingly
  let getText = repeatBtn.innerText; //getting this tag innerText
  switch(getText){
    case "repeat":
      nextMusic(); //calling nextMusic function
      break;
    case "repeat_one":
      mainAudio.currentTime = 0; //setting audio current time to 0
      loadMusic(musicIndex); //calling loadMusic function with argument, in the argument there is a index of current song
      playMusic(); //calling playMusic function
      break;
    case "shuffle":
      let randIndex = Math.floor((Math.random() * allMusic.length) + 1); //genereting random index/numb with max range of array length
      do{
        randIndex = Math.floor((Math.random() * allMusic.length) + 1);
      }while(musicIndex == randIndex); //this loop run until the next random number won't be the same of current musicIndex
      musicIndex = randIndex; //passing randomIndex to musicIndex
      loadMusic(musicIndex);
      playMusic();
      playingSong();
      break;
  }
});

//show music list onclick of music icon
moreMusicBtn.addEventListener("click", ()=>{
  musicList.classList.toggle("show");
});
closemoreMusic.addEventListener("click", ()=>{
  moreMusicBtn.click();
});

const ulTag = wrapper.querySelector("ul");
// let create li tags according to array length for list
for (let i = 0; i < allMusic.length; i++) {
  //let's pass the song name, artist from the array
  let liTag = `<li li-index="${i + 1}">
                <div class="row">
                  <span>${allMusic[i].name}</span>
                  <p>${allMusic[i].artist}</p>
                </div>
                <span id="${allMusic[i].src}" class="audio-duration">3:40</span>
                <audio class="${allMusic[i].src}" src="songs/${allMusic[i].src}.mp3"></audio>
              </li>`;
  ulTag.insertAdjacentHTML("beforeend", liTag); //inserting the li inside ul tag

  let liAudioDuartionTag = ulTag.querySelector(`#${allMusic[i].src}`);
  let liAudioTag = ulTag.querySelector(`.${allMusic[i].src}`);
  liAudioTag.addEventListener("loadeddata", ()=>{
    let duration = liAudioTag.duration;
    let totalMin = Math.floor(duration / 60);
    let totalSec = Math.floor(duration % 60);
    if(totalSec < 10){ //if sec is less than 10 then add 0 before it
      totalSec = `0${totalSec}`;
    };
    liAudioDuartionTag.innerText = `${totalMin}:${totalSec}`; //passing total duation of song
    liAudioDuartionTag.setAttribute("t-duration", `${totalMin}:${totalSec}`); //adding t-duration attribute with total duration value
  });
}

//play particular song from the list onclick of li tag
function playingSong(){
  const allLiTag = ulTag.querySelectorAll("li");
  
  for (let j = 0; j < allLiTag.length; j++) {
    let audioTag = allLiTag[j].querySelector(".audio-duration");
    
    if(allLiTag[j].classList.contains("playing")){
      allLiTag[j].classList.remove("playing");
      let adDuration = audioTag.getAttribute("t-duration");
      audioTag.innerText = adDuration;
    }

    //if the li tag index is equal to the musicIndex then add playing class in it
    if(allLiTag[j].getAttribute("li-index") == musicIndex){
      allLiTag[j].classList.add("playing");
      audioTag.innerText = "Playing";
    }

    allLiTag[j].setAttribute("onclick", "clicked(this)");
  }
}

//particular li clicked function
function clicked(element){
  let getLiIndex = element.getAttribute("li-index");
  musicIndex = getLiIndex; //updating current song index with clicked li index
  loadMusic(musicIndex);
  playMusic();
  playingSong();
}



