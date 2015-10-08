<popup>

  <gate if={!state.connected} send={this.opts.send}>
  </gate>

  <lobby if={ isLobby() } send={this.opts.send}>
  </lobby>

  <room if={ isRoom() } send={ this.opts.send }
    roomName={ state.room } tab={ state.tab }>
  </room>

  <style scoped>
    :scope {
      width: 300px;
      height: 150px;
      display: block;
      position: relative;
    }
  </style>

  this.state = this.opts.state;

  updateState(state) {
    this.state = state
    this.update();
  }

  isLobby() {
    return this.state.connected && this.state.room === "lobby";
  }

  isRoom() {
    return this.state.connected && this.state.room !== "lobby";
  }

</popup>




<gate>
  <form onsubmit={submit}>
    <div class="error" if={error}><p>Error connecting to server.</p></div>
    <input type="text" placeholder="Server" onkeyup={edit}></input>
    <button>Connect</button>
  </form>


  <script>

    edit(e) {
      this.server = e.target.value;
    }

    submit(e) {
      this.opts.send({type:"connect",url: this.server});
    }


  </script>
</gate>

<lobby>
  <h1>Lobby</h1>
  <ul>
    <li each={ rooms }>
      <a href="#" class="roomLink" onclick={ parent.joinRoom }>{ title }</a>
    </li>
  </ul>

  <style scoped>
    ul {
      list-style: none;
      padding-left: 0;
    }
  </style>


  this.rooms = [{title: "Room 1", id: "room1"},{title: "Room 2", id: "room2"}];

  joinRoom(event) {
    this.opts.send({type:"joinChannel",channel: event.item.id});
  }


</lobby>


<room>
  <h1>{ this.opts.roomname }</h1>
  <a href="#" class="sync-link" onclick={ syncTab }>Sync Current Tab</a>
  <h3 if={ this.opts.tab != null }>{ this.opts.tab }</h3>
  <a href="#" class="back-link" onclick={ goBack }>Back To Lobby</a>

  <style scoped>
    .back-link {
      position:absolute;
      bottom: 0;
      left: 0;
    }
  </style>

  syncTab() {
    this.opts.send({type:"syncTab"});
  }

  goBack() {
    this.opts.send({type:"joinChannel",channel: "lobby"});
  }

</room>
