/*****使用"面向对象"的方式来创建游戏*****/
//使用"对象直接量"法来创建对象
var t = { //游戏对象
    rows: 18,            //表格行数
    cols: 11,            //表格列数
    table: null,        //呈现在页面中的表格对象<table></table>
    isRunning: false,   //游戏当前是否在运行，控制游戏的暂停和运行
    timer: null,        //让游戏中的方块自动下移的定时器对象
    curBlock: null,     //呈现在表格中供玩家操作的方块图
    curBlock0: null,    //控制显示下一次的方块图形状
    tableData: null,    //用于保存页面中<table>元素的单元格的数据
    tableData0: null,   //用于保存控制下一次形状的<table>(用户看不见)元素的单元格数据
    rowIndex: 2,        //要显示的方块图形当前在dataTable中的行坐标
    colIndex: 6,        //要显示的方块图形当前在dataTable中的列坐标
    Score: 0,           //当前得分
    highScore: 0,       //最高分
    isTheFirstOne: 1,   //第一个下落方块
    speed: 500,          //速度，用时间间隔表示
    isOver: 0,          //第一次游戏是否结束

    //游戏中所有可能出现的方块，采用坐标对存储，[0,0]坐标为旋转中心！
    block_L: [[0, 0],[1, 0],[2, 0],[0, 1]],      //L型
    block_dL: [[0, 0],[1, 0],[2, 0],[0, -1]],    //反L型
    block_T: [[0, 0],[0, -1],[0, 1],[1, 0]],     //T型
    block_H: [[0, 0],[0, 1],[1, 0],[1, 1]],      //田型
    block_l: [[-1, 0], [0, 0],[1, 0],[2, 0]],    //I型
    block_Z: [[0, 0],[1, 0],[1, 1],[0, -1]],     //Z型
    block_dZ: [[0, 0], [1, 0], [0, 1], [1, -1]], //反Z型

    drawTable: function () { //画出游戏表格
        t.table = document.getElementById('playground');
        t.curBlock0 = document.getElementById('playground0');
        t.highScore = getHighScoreFromCookie();
        document.getElementById('highestScore').innerHTML = t.highScore.toString();//分数赋值
        if (t.isOver != 1) {
            for (var i = 0; i < t.rows; i++) {
                var row = t.table.insertRow();   //HTMLDOM方法创建新的tr
                for (var j = 0; j < t.cols; j++) {
                    var cell = row.insertCell(); //HTMLDOM方法创建新的td
                    cell.className = 'cell';
                }
            }
            for (var i = 0; i < 4; i++) { //控制绘制  暂定是4*4的显示窗口
                var row0 = t.curBlock0.insertRow();
                for (var j = 0; j < 4; j++) {
                    var cell0 = row0.insertCell();
                    cell0.className = 'cell0';
                }
            }
        }
        if (t.isOver != 1) { //如果游戏结束，下次就不用绘制，这是一次性的
            t.tableData = [];
            t.tableData0 = [];
        }
        for (var i = 0; i < 4; i++) {
            if (t.isOver != 1) {
                t.tableData0[i] = [];
            }
        }
        for (var i = 0; i < t.rows + 4; i++) {
            if (t.isOver != 1) {
                t.tableData[i] = [];
            }
            for (var j = 0; j < t.cols + 4; j++) { //预留一定的边界。预留2格，左右下有用户不可见的2格墙，上方没有
                if (i < 2 || i >= t.rows + 2 || j >= t.cols + 2 || j < 2) {
                    t.tableData[i][j] = 1;
                }
                else {
                    t.tableData[i][j] = 0;
                }
                if (i < 2) //上方的墙去掉
                {
                    t.tableData[i][j] = 0;
                }
            }
        }
    },

    /*******根据二维表格数据绘制TD的背景色*******/
    repaint: function () { //tableData数据发生变化，就重新绘制表格
        for (var i = 0; i < 4; i++) {
            for (var j = 0; j < 4; j++) {
                if (t.tableData0[i][j] == 1) {
                    t.curBlock0.rows[i].cells[j].style.background = '#333';
                }
                else if (t.tableData0[i][j] == 0) {
                    t.curBlock0.rows[i].cells[j].style.background = '#fff';
                }
            }
        }
        for (var i = 0; i < t.rows; i++) {
            for (var j = 0; j < t.cols; j++) {
                if (t.tableData[i + 2][j + 2] == 1) {     //1表示是墙，游戏的边界
                    t.table.rows[i].cells[j].style.background = '#aaa';
                }
                else if (t.tableData[i + 2][j + 2] == 3)  //3是当前下落方块
                {
                    t.table.rows[i].cells[j].style.background = '#f00';
                }
                else if (t.tableData[i + 2][j + 2] == 0)  //空白
                {
                    t.table.rows[i].cells[j].style.background = '#fff';
                }
                else if (t.tableData[i + 2][j + 2] == 2)  //下方累积方块
                {
                    t.table.rows[i].cells[j].style.background = '#666';
                }
            }
        }
    },

    restart: function () { //重启下一盘
        t.drawTable();
        document.getElementById("curScore").innerHTML = t.Score.toString();
        t.bindKeyListener();
    },

    bindKeyListener: function () { //绑定键盘事件监听器
        window.onkeydown = function () {
            var key = event.which || event.keyCode || event.charCode;
            switch (key) {
                case 27: //ESC
                 t.stop();
                 break;
                case 32: //Space
                    t.resumeOrPause();
                    break;
                case 37: //←
                    t.moveLeft();
                    break;
                case 38: //↑
                    t.rotate();
                    break;
                case 39: //→
                    t.moveRight();
                    break;
                case 40: //↓
                    t.moveDown();
                    break;
            }
            //阻止事件的默认行为，如↑的默认会让窗口向上滚动，↓的默认行为让窗口向下滚动，space键默认都会让屏幕滚动
            event.returnValue = false;  //IE
            if(!!(event.preventDefault)){
                event.preventDefault();
            }
        }
    },

    stop: function () {  //游戏退出
        t.recHighScore(); //记录最高分
        document.getElementById('highestScore').innerHTML=t.highScore;  //修改当前显示的最高分值
        console.log("游戏退出");
        if (t.timer != null) {
            clearInterval(t.timer);
            t.timer = null;
        }
     },

    resumeOrPause: function () { //暂停或重启游戏
        if (t.isRunning) {
            console.log("游戏暂停");
            t.isRunning = false;
        } else {
            console.log("游戏开始");
            t.isRunning = true;
            t.timer = setInterval(t.moveDown, t.speed); //每隔一定周期让方块下移一次
            console.log(t.timer);
        }
    },

    moveLeft: function () { //方块左移
        if (!t.isRunning) {
            return;
        }
        for (var i = 0; i < t.curBlock.length; i++) {
            if (t.tableData[t.curBlock[i][0]][t.curBlock[i][1] - 1] == 1 || t.tableData[t.curBlock[i][0]][t.curBlock[i][1] - 1] == 2){ //如果要移动的下一处是墙或者是累积方块,则跳出
                return;
            }
        }
        for (var i = 0; i < t.curBlock.length; i++) {
            t.tableData[t.curBlock[i][0]][t.curBlock[i][1]] = 0
        }
        for (var i = 0; i < t.curBlock.length; i++) {
            t.curBlock[i][1]--;
        }
        console.log('左移');
    },

    moveRight: function () { //方块右移
        if (!t.isRunning) {
            return;
        }
        for (var i = 0; i < t.curBlock.length; i++) {
            if (t.tableData[t.curBlock[i][0]][t.curBlock[i][1] + 1] == 1 || t.tableData[t.curBlock[i][0]][t.curBlock[i][1] + 1] == 2) {
                return;
            }
        }
        for (var i = 0; i < t.curBlock.length; i++) {
            t.tableData[t.curBlock[i][0]][t.curBlock[i][1]] = 0
        }
        for (var i = 0; i < t.curBlock.length; i++) {
            t.curBlock[i][1]++;
        }
        console.log('右移');
    },

    cancellation: function () { //消去可以消去的所有行
        var score = 0;
        for (var i = t.rows + 2; i >= 2; i--) {
            for (var j = 2; j < t.cols + 2; j++) {
                if (t.tableData[i][j] != 2) {
                    break;
                }
            }
            if (j == t.cols + 2) {
                t.cancellation_row(i);
                i++;
                score++;
            }
        }
        t.Score = t.Score + score;
        document.getElementById("curScore").innerHTML = t.Score.toString();
    },

    cancellation_row: function (n) { //消去某一行
        for (var i = n; i >= 2; i--) {
            for (var j = 0; j < t.cols; j++) {
                t.tableData[i][j] = t.tableData[i - 1][j];
            }
        }
    },

	recHighScore:function(){
		 if (t.highScore < t.Score)//记录最高分
        		{
        		    t.highScore = t.Score;
        		    recHighScoreForCookie(t.highScore);
        		}
	},

    moveDown: function () { //方块下移
        if (!t.isRunning) {
            return;
        }
        if (!t.curBlock) { //若当前还没有方块，则随机创建一个方块图形
            t.generateBlock();
        }
        for (var k = 0; k < t.curBlock.length; k++) {
            if (t.tableData[t.curBlock[k][0] + 1][t.curBlock[k][1]] == 1 || t.tableData[t.curBlock[k][0] + 1][t.curBlock[k][1]] == 2) {
                for (var j = 0; j < t.curBlock.length; j++) {
                    t.tableData[t.curBlock[j][0]][t.curBlock[j][1]] = 2;
                }
                t.curBlock = null;
                t.cancellation();
                t.generateBlock();
                if (t.isGameOver() == 1) {
                    t.recHighScore();
                    alert("游戏结束！点击“确定”，可重新开始游戏！");
                    t.Score = 0;
                    t.isOver = 1;
                    self.clearInterval(t.timer);
                    t.speed = 500; //速度重置
                    t.timer = setInterval(t.moveDown, t.speed);
                    t.restart();
                }
                return;
            }
        }
        for (var i = 0; i < t.curBlock.length; i++) {
            t.tableData[t.curBlock[i][0]][t.curBlock[i][1]] = 0;
        }
        for (var i = 0; i < t.curBlock.length; i++) {
            t.tableData[t.curBlock[i][0] + 1][t.curBlock[i][1]] = 3;
            t.curBlock[i][0]++;
        }
        t.repaint();
    },

    isGameOver: function () { //判断是否游戏结束
        for (var j = 2; j >= 0; j--) {
            for (var i = 2; i < t.cols + 2; i++) {
                if (t.tableData[j][i] != 0) {
                    return 1;
                }
            }
        }
        return 0;
    },

    rotate: function () { //方块顺时针旋转90度
        var a = [0, 0];
        var b = [0, 0];
        //此处算法是归纳出来的。当00是中心时，横坐标变成纵坐标，纵坐标为负的横坐标
        a[0] = t.curBlock[0][0];
        a[1] = t.curBlock[0][1];
        for (var i = 0; i < t.curBlock.length; i++) {
            b[0] = t.curBlock[i][0] - a[0];
            b[1] = t.curBlock[i][1] - a[1];
            if (t.tableData[a[0] + b[1]][a[1] - b[0]] == 1 || t.tableData[a[0] + b[1]][a[1] - b[0]] == 2) {
                return;
            }
        }
        for (var i = 0; i < t.curBlock.length; i++) {
            t.tableData[t.curBlock[i][0]][t.curBlock[i][1]] = 0;
        }
        for (var i = 0; i < t.curBlock.length; i++) {
            b[0] = t.curBlock[i][0] - a[0];
            b[1] = t.curBlock[i][1] - a[1];
            t.curBlock[i][0] = a[0] + b[1];
            t.curBlock[i][1] = a[1] - b[0];
        }
        console.log('变形');
    },

    generateBlock: function () {  //从所有可能的图形中随机抽取一个图形
        t.speed = t.speed * 0.99; //速度变化率
        self.clearInterval(t.timer);
        t.timer = setInterval(t.moveDown, t.speed);
        var n = Math.floor(Math.random() * 7);
        if (t.isTheFirstOne == 1) {
            if (n == 1) {
                m = this.block_T;
                console.log('T');
            }
            else if (n == 2) {
                m = this.block_H;
                console.log('H');
            }
            else if (n == 3) {
                m = this.block_L;
                console.log('L');
            }
            else if (n == 0) {
                m = this.block_l;
                console.log('l');
            }
            else if (n == 4) {
                m = this.block_Z;
                console.log('Z');
            }
            else if (n == 5) {
                m = this.block_dL;
                console.log('dL');
            }
            else if (n == 6) {
                m = this.block_dZ;
                console.log('dZ');
            }
            t.isTheFirstOne = 0;
        }
        //创建一个现有的图形副本（可以随意变形，而不会影响原来的），呈现在表格中
        //curBlock=m;没有创建新的图形副本
        t.curBlock = [];
        for (i = 0; i < 4; i++) {
            t.curBlock[i] = [];
            t.curBlock[i][0] = m[i][0] + t.rowIndex;
            t.curBlock[i][1] = m[i][1] + t.colIndex;
        }
        n = Math.floor(Math.random() * 7);
        if (t.isTheFirstOne == 0) {
            if (n == 1) {
                m = this.block_T;
                console.log('T');
            }
            else if (n == 2) {
                m = this.block_H;
                console.log('H');
            }
            else if (n == 3) {
                m = this.block_L;
                console.log('L');
            }
            else if (n == 0) {
                m = this.block_l;
                console.log('l');
            }
            else if (n == 4) {
                m = this.block_Z;
                console.log('Z');
            }
            else if (n == 5) {
                m = this.block_dL;
                console.log('dL');
            }
            else if (n == 6) {
                m = this.block_dZ;
                console.log('dZ');
            }
        }
        for (var i = 0; i < 4; i++) {
            for (var j = 0; j < 4; j++) {
                t.tableData0[i][j] = 0;
            }
        }
        for (var i = 0; i < m.length; i++) {
            t.tableData0[m[i][0] + 1][m[i][1] + 1] = 1;
        }
    }
};

/*****记录历史最高分*****/
function recHighScoreForCookie(score) { //写cookie
    var d = new Date();
    d.setTime(d.getTime() + 30 * 24 * 60 * 60 * 1000);
    document.cookie = 't.highScore=' + score + ";expires=" + d.toGMTString();
}
function getHighScoreFromCookie() { //取cookie
    if (!(typeof (document.cookie) == 'string' && document.cookie.length > 0)){
        return 0;
    }
    var score = 0;
    try {
        score = parseInt(document.cookie.match(/t.highScore=[0-9]*;?/)[0].split('=')[1]);
        if (isNaN(score)){
            score = 0;
        }
    } catch (e) {
        score = 0;
    }
    return score;
}
t.bindKeyListener();
t.restart();

