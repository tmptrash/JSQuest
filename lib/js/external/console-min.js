var Console = {};
Console.init = function (id, username, hostname, actions, hideuser) {
    /**
     * @prop
     * {Boolean} false if user can type commands, true - if not.
     */
    this.busy = false;

    this.console = document.getElementById(id);
    this.console.focus();
    this.text = this.console.value;
    this.bkp = this.text;
    this.user = username + '@' + hostname + ':~$ ';
    if (!hideuser) {
        Console.Write(this.user);
    }
    this.act = actions;
    this.mem = [''];
    this.mempos = 0;
    this.isReadLinee = false;
    this.console.onkeydown = function (evnt) {
        var e = evnt;
        if (e === undefined) {
            e = window.event;
        }
        return Console.KeyPress(e);
    };
    this.console.onkeyup = function (evnt) {
        var e = evnt;
        if (e === undefined) {
            e = window.event;
        }
        Console.KeyUp(e);
        return false;
    };
    this.console.onmousedown = function (evnt) {
        this.focus();
        return false;
    };
    this.console.onfocus = function (evnt) {
        Console.SetCaretPos(this.value.length);
    };
};

/**
 * Activates/Deactivates console.
 * @param {Boolean} busy true - activate console for commands typing, false otherwise
 */
Console.setBusy = function (busy) {
    this.busy = !!busy;
};
Console.KeyPress = function (e) {
    if (this.busy) {
        return false;
    }

    switch (e.keyCode) {
        case 13:
            this.Enter();
            return false;
        case 8:
        case 37:
            return(this.GetCaretPos() > this.bkp.length);
        case 36:
            this.SetCaretPos(this.bkp.length);
            return false;
        case 38:
            if (this.mem.length == 0)
                return false;
            this.mempos--;
            if (this.mempos < 0) {
                this.mempos = this.mem.length - 1;
            }
            this.text = this.bkp + this.mem[this.mempos];
            this.console.value = this.text;
            return false;
        case 40:
            if (this.mem.length == 0)
                return false;
            this.mempos++;
            if (this.mempos >= this.mem.length) {
                this.mempos = 0;
            }
            this.text = this.bkp + this.mem[this.mempos];
            this.console.value = this.text;
            return false;
        default:
            if (this.GetCaretPos() < this.bkp.length) {
                this.SetCaretPos(this.bkp.length);
                return false;
            }
            return true;
    }
};
Console.KeyUp = function (e) {
    if (this.busy) {
        return false;
    }

    switch (e.keyCode) {
        case 8:
        case 37:
        case 46:
            if (this.console.value.length < this.bkp.length) {
                this.console.value = this.bkp;
            }
            break;
        default:
            break;
    }
};
Console.Enter = function () {
    this.text = this.console.value;
    var pos = this.text.lastIndexOf(this.user) + this.user.length;
    var commandstr = this.text.substring(pos, this.text.length);
    var pattern = /([A-Za-zА-Яа-яЁё0-9\-_,\.']+)|"([A-Za-zА-Яа-яЁё0-9\-_,\.'\s\\n]+)"/g;
    var args = commandstr.match(pattern);
    Console.WriteLine('');
    if (args != null) {
        var command = args[0];
        if ((command.toLowerCase() == 'help') || (command.toLowerCase() == 'man')) {
            Console.Help(args);
        }
        else {
            var flag = false;
            var len = this.act.length;
            for (var i = 0; i < len; i++) {
                if (this.act[i][0] == command) {
                    flag = true;
                    var f = this.act[i][1];
                    f(args);
                    break;
                }
            }
            if (!flag) {
                Console.WriteLine(command + ': command not found');
            }
        }
        this.mem[this.mem.length - 1] = commandstr;
        this.mem[this.mem.length] = '';
        this.mempos = this.mem.length - 1;
    }
    this.showUserLine();
};
/**
 * Shows user line in format: username + '@' + host + ':~$'
 */
Console.showUserLine = function () {
    this.text += this.user;
    this.console.focus();
    this.console.value = this.text;
    this.bkp = this.text;
};

Console.GetCaretPos = function () {
    if (document.selection) {
        var sel = document.selection.createRange();
        var clone = sel.duplicate();
        sel.collapse(true);
        clone.moveToElementText(obj);
        clone.setEndPoint('EndToEnd', sel);
        return clone.text.length;
    }
    else if (this.console.selectionStart !== false)
        return this.console.selectionStart; else return 0;
};
Console.SetCaretPos = function (pos) {
    if (document.selection) {
        this.console.setSelectionRange(pos, pos);
    }
    else {
        this.console.selectionStart = pos;
        this.console.selectionEnd = pos;
    }
};
Console.Help = function (args) {
    var len = this.act.length;
    if ((args.length < 2) || ((args.length >= 2) && (args[1] == args[0]))) {
        Console.WriteLine('Type "' + args[0] + ' <cmd>", where <cmd> - any item from list below:');
        for (var i = 0; i < len; i++)
            Console.WriteLine(this.act[i][0]);
    }
    else {
        var flag = false;
        for (var i = 0; i < len; i++)
            if (this.act[i][0] == args[1]) {
                flag = true;
                if (this.act[i][2] === undefined) {
                    Console.WriteLine('No man pages for ' + args[1]);
                    break;
                }
                Console.WriteLine(this.act[i][2]);
                break;
            }
        if (!flag)
            Console.WriteLine(args[1] + ': command not found');
    }
};
Console.Clear = function () {
    this.text = '';
    this.console.value = '';
};
Console.Write = function (str) {
    this.text += str;
    this.bkp += str;
    this.console.value = this.text;
};
Console.WriteLine = function (str) {
    Console.Write(str + '\n');
};
Console.ReadLine = function () {
    alert('hello!');
};