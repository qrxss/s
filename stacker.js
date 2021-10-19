function StackerGame() {
  
  // Game constants
  this.BOARD_WIDTH = 7;
  this.BOARD_HEIGHT = 15;
  this.LIMIT_3 = 2;
  this.LIMIT_2 = 7;
  this.MIN_SPEED = (6/64);
  this.MAX_SPEED = (2/64);
  this.ANIMATION_TIME = 1.5 * 60;
  
  // Initialize members
  this.gameElement = document.getElementById('stacker-game');
  this.gameBoard   = null;
  
  // Initialize board state
  this.board = new Array(this.BOARD_HEIGHT);
  for (i = 0; i < this.BOARD_HEIGHT; i++) {
    this.board[i] = new Array(this.BOARD_WIDTH);
    for (j = 0; j < this.BOARD_WIDTH; j++) {
      this.board[i][j] = 0;
    }
  }
  
  // Game state variables
  this.blocks = 3;
  this.running = false;
  this.level = 0;
  this.pos = Math.floor(this.BOARD_WIDTH / 2) - Math.floor(this.blocks / 2);
  this.left = true;
  this.timer = 0;
  this.atimer = 0;
  
  
  
  /**
   * Build HTML elements
   */
  this.buildHTML = function() {
    
    // build table
    var domTable = document.createElement('table');
    for (i = 0; i < this.BOARD_HEIGHT; i++) {
      var domTableRow = domTable.insertRow(i);
      for (j = 0; j < this.BOARD_WIDTH; j++) {
        domTableRow.insertCell(j);
      }
    }
    
    // Add table to HTML
    domTable.classList.add('stacker-board');
    this.gameBoard = domTable;
    this.gameElement.appendChild(this.gameBoard);
  };
  
  
  
  /**
   * Starts the game running
   */
  this.run = function() {
    setInterval(function() {game.onStep()}, 1000/60);
    window.addEventListener("keydown", function(e) {game.onKeyPress(e)});
    this.gameBoard.addEventListener("touchstart", function(e) {game.onTouchStart(e)});
  };
  
  
  
  /**
   * Handles each step event
   */
  this.onStep = function() {
    if (this.atimer > 0) {
      this.atimer--;
    }
    
    if (this.atimer == 0) {
      
      // Remove temporary (flashing) blocks
      for (i = 0; i < this.BOARD_HEIGHT; i++) {
        for (j = 0; j < this.BOARD_WIDTH; j++) {
          if (this.board[i][j] == 2) {
            this.board[i][j] = 0;
          }
        }
      }
      
      if (this.blocks == 0) {
        this.running = false;
      }
    }
    
    // Move blocks over
    if (this.running && this.atimer == 0) {
      if (this.timer <= 0) {
        if (this.left) {
          this.pos--;
          if (this.pos + this.blocks - 1 == 0) {
            this.left = false;
          }
        } else {
          this.pos++;
          if (this.pos == this.BOARD_WIDTH - 1) {
            this.left = true;
          }
        }
        this.timer = (this.MAX_SPEED + ((this.MIN_SPEED - this.MAX_SPEED) * (1 - (this.level / this.BOARD_HEIGHT)))) * 60;
      } else {
        this.timer--;
      }
    }
    
    // Redraw grid
    for (i = 0; i < this.BOARD_HEIGHT; i++) {
      for (j = 0; j < this.BOARD_WIDTH; j++) {
        switch (this.board[i][j]) {
          case 0:
            this.gameBoard.rows[this.BOARD_HEIGHT - 1 - i].cells[j].className = "";
            break;
          case 1:
            this.gameBoard.rows[this.BOARD_HEIGHT - 1 - i].cells[j].className = "filled";
            break;
          case 2:
            this.gameBoard.rows[this.BOARD_HEIGHT - 1 - i].cells[j].className = (this.atimer > 0 && this.atimer % 30 < 15 ? "filled" : "");
            break;
        }
      }
    }
    // Draw bouncing blocks
    if (this.running && this.atimer == 0) {
      for (j = this.pos; j < this.pos + this.blocks; j++) {
        if (j >= 0 && j < this.BOARD_WIDTH) {
          this.gameBoard.rows[this.BOARD_HEIGHT - 1 - this.level].cells[j].className = "filled";
        }
      }
    }
  }
  
  
  
  /**
   * Handles keyboard press events
   */
  this.onKeyPress = function(e) {
    var e = e || window.event;
    
    switch (e.keyCode) {
      case 32:  // Space
        this.onSpacePress();
        e.preventDefault();
        break;
        
      case 13:  // Enter/return
        this.onEnterPress();
        e.preventDefault();
        break;
    }
  }
  
  
  
  /**
   * Handles touch screen device touch
   */
  this.onTouchStart = function(e) {
    if (this.running) {
      this.onSpacePress();
    } else {
      this.onEnterPress();
    }
  }
  
  
  
  /**
   * Handles spacebar presses
   */
  this.onSpacePress = function() {
    if (!this.running) {
      this.onEnterPress();

    } else if (this.atimer == 0) {
    
      // put blocks onto board
      var iEnd = (this.pos + this.blocks);
      for (i = this.pos; i < iEnd; i++) {
        if (i >= 0 && i < this.BOARD_WIDTH) {
          this.board[this.level][i] = 1;
        } else {
          this.blocks--;
        }
      }
      
      // Remove invalid blocks
      if (this.level > 0) {
        for (i = 0; i < this.BOARD_WIDTH; i++) {
          if (this.board[this.level][i] == 1 && this.board[this.level-1][i] == 0) {
            this.board[this.level][i] = 2;
            this.blocks--;
            this.atimer = this.ANIMATION_TIME;
          }
        }
      }
      
      // Check hard limits
      if (this.blocks >= 3 && this.level >= this.LIMIT_3) {
        this.blocks = 2;
      }
      if (this.blocks >= 2 && this.level >= this.LIMIT_2) {
        this.blocks = 1;
      }
      if (this.level == this.BOARD_HEIGHT - 1) {
        this.running = false;
      }
      
      this.level++;
      this.pos = Math.floor(this.BOARD_WIDTH / 2);
    }
  }
  
  
  
  /**
   * Handles enter/return presses
   */
  this.onEnterPress = function() {
    
    // Initialize board
    for (i = 0; i < this.BOARD_HEIGHT; i++) {
      for (j = 0; j < this.BOARD_WIDTH; j++) {
        this.board[i][j] = 0;
      }
    }

    // Reset everything else
    this.level = 0;
    this.blocks = 3;
    this.pos = Math.floor(this.BOARD_WIDTH / 2) - Math.floor(this.blocks / 2);
    this.left = true;
    this.running = true;
    this.atimer = 0;
  }
  
  
}

game = null;

window.addEventListener("DOMContentLoaded", function(){
  game = new StackerGame();
  game.buildHTML();
  game.run();
});
