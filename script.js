const ON = true;
const OFF = false;
const EMPTY = 0;
const TETRIS = 1;
const SQUARE = 2;
const KEY1 = 3;
const KEY2 = 4;
const L1 = 5;
const L2 = 6;
const T = 7;

const COLUMN = 10;
const ROW = 20;

let debug = false;//true;
let sw_control;

let canvas = document.getElementById("myCanvas");
let ctx = canvas.getContext("2d");

const BlockSize = canvas.height / ROW;

const Tetriminos = [
// [[row,column],[...],[...],[...]]
    [[0,0],[0,0],[0,0],[0,0]],  //EMPTY
    [[1,0],[1,1],[1,2],[1,3]],  //TETRIS
    [[0,0],[0,1],[1,0],[1,1]],  //SQUARE
    [[0,0],[0,1],[1,1],[1,2]],  //KEY1
    [[0,2],[0,1],[1,1],[1,0]],  //KEY2
    [[0,0],[0,1],[0,2],[1,0]],  //L1
    [[0,0],[0,1],[0,2],[1,2]],  //L2
    [[0,0],[0,1],[0,2],[1,1]],  //T
];

let BlockInfo = new Object();

let field = (new Array(ROW+4)).fill(0);

main();

//soft drop
//ghost
//combo

function main() {
    generateGame();

    const countUp = () => {
        const timeoutId = setTimeout(countUp, 800);

        let collision = drop_block();
        sw_control = ON;

        check_contitune(timeoutId)

        document.addEventListener('keydown', keyevent);

        if (check_complited_line())  {
            sw_control = OFF;
            clearTimeout(timeoutId);    //メインタイマー停止
            let delite_row = delite_complited_line();
            let count = 0;
            let id = setInterval(function () {
                //タイマー終了後の処理
                clearInterval(id);
                drop_lines(delite_row);
                countUp();  //メインタイマー開始
                new_block();
            }, 2000);
        } else {
            if (collision) new_block();
        }
    }
    countUp();
}

function generateGame() {
    //BlockInfoの設定
    BlockInfo.type = 0;
    BlockInfo.addr = Tetriminos[EMPTY];
    BlockInfo.rotate = 0;   //BlockInfo.typeがTETRISの時に使用

    //field setting
    field.forEach((_, i) => {field[i] = (new Array(COLUMN+4)).fill(0);});

    for(let i = 2; i < COLUMN + 2; i++)    {
        field[ROW + 2][i] = 9;
        field[ROW + 3][i] = 9;
    }
    for(let i = 0; i < ROW + 4; i++)    {
        field[i][0] = 9;
        field[i][1] = 9;
        field[i][COLUMN + 2] = 9;
        field[i][COLUMN + 3] = 9;
    }

    new_block();
}

function keyevent(e) {
    if (sw_control) {
        switch (e.key) {
            case 'ArrowUp':
                //console.log('↑');
                break;
            case 'ArrowDown':
                //console.log('↓');
                drop_block();
                break;
            case 'ArrowLeft':
                //console.log('←');
                move_left();
                break;
            case 'ArrowRight':
                //console.log('→');
                move_right();
                break;
            case 'x':
                //console.log('x');
                rotate_clockwise();
                break;
            case 'z':
                //console.log('z);
                rotate_counter_clockwise();
                break
        }
    }
}

function check_contitune(timeoutId)  {
    let collision = 0;
    const row = 1;
    for (let j = 2; j < COLUMN+2; j++)  {
        collision += field[row][j];
    }
    if (collision != 0) {
        console.log("game over!");
        clearTimeout(timeoutId);
        done = true;
    }
}

function new_block()    {
    let shift = Math.ceil(COLUMN/2) + 1;
    let random = Math.floor(Math.random() * 7) + 1;

    BlockInfo.type = random;
    for (let i = 0; i < 4; i++) {
        BlockInfo.addr[i][0] = Tetriminos[random][i][0];
        BlockInfo.addr[i][1] = Tetriminos[random][i][1]+shift;
    }
}

function check_complited_line()   {
    let value;
    let comlited_line = false;
    for (let row = ROW+1; row > 1; row--)    {
    value = 1;
        for (let column = 2; column < COLUMN+2; column++)    {
            value *= field[row][column];
        }
        if (value != 0) {
            comlited_line = true;
            break;
        }
    }
    if (!comlited_line) switch_controll = ON;
    return comlited_line;
}

function delite_complited_line()   {
    let value;
    let count = 3;
    let ary = new Array(4);

    for (let row = ROW+1; row > 1; row--)    {
        value = 1;
        for (let column = 2; column < COLUMN+2; column++)    {
            value *= field[row][column];
        }
        if (value != 0)   {
            ary[count] = row;
            for (let column = 2; column < COLUMN+2; column++)    {
                field[row][column] = 0;
            }
            count -= 1;
        }
    }

    console_debug();
    draw_block();
    return ary;
}

function drop_lines(ary)   {
    ary.forEach(function(element) {
        for (let row = element; row > 1; row--)    {
            for (let column = 2; column < COLUMN+2; column++)    {
                field[row][column] = field[row-1][column];
            }
        }
    });

    console_debug();
    draw_block();
}

function drop_block() {
    //ブロックを動かしていいのか判定する
    let row, column;
    let collision = 0;
    let col = false;

    //衝突の検査
    for(let i = 0; i < 4; i++)  {
        row = BlockInfo.addr[i][0] + 1;
        column = BlockInfo.addr[i][1];
        collision += field[row][column];
    }

    //衝突
    if(collision != 0)    {
        //ブロックをフィールドに描く
        for(let i = 0; i < 4; i++)  { 
            row = BlockInfo.addr[i][0];
            column = BlockInfo.addr[i][1];
            field[row][column] = BlockInfo.type;
        }
        col = true;

        for (let i = 0; i < 4; i++) {
            BlockInfo.addr[i][0] = 0;
            BlockInfo.addr[i][1] = 0;
        }
        
    } else  {
        //アドレスの更新
        for(let i = 0; i < 4; i++)  {
            BlockInfo.addr[i][0]++;
        }
    }
    console_debug();
    draw_block();
    
    return col;
}

function move_left()    {
    let row, column;
    let collision = 0;

    //衝突の検査
    for(let i = 0; i < 4; i++)  {
        row = BlockInfo.addr[i][0];
        column = BlockInfo.addr[i][1] - 1;
        collision += field[row][column];
    }

    if(collision == 0)    {
        //アドレスを更新
        for(let i = 0; i < 4; i++)  {
            BlockInfo.addr[i][1] -= 1;
        }
    }

    console_debug();
    draw_block();
}

function move_right()   {
    let row, column;
    let collision = 0;

    //衝突の検査
    for(let i = 0; i < 4; i++)  {
        row = BlockInfo.addr[i][0];
        column = BlockInfo.addr[i][1] + 1;
        collision += field[row][column];
    }

    if(collision == 0)    {
        //アドレスを更新
        for(let i = 0; i < 4; i++)  {
            BlockInfo.addr[i][1] += 1;
        }
    }

    console_debug();
    draw_block();
}

function rotate_clockwise() {
    let entry;
    let row_shift, column_shift;
    let collision = 0;
    let row_addr = new Array(4);
    let column_addr = new Array(4);

    //衝突の検査
    if (BlockInfo.type == TETRIS)   {
        for (let i = 0; i < 4; i++) {
            row_addr[i] = BlockInfo.addr[i][1];
            column_addr[i] = BlockInfo.addr[i][0];
        }

        if (BlockInfo.rotate == 0 || BlockInfo.rotate == 3) entry = 1;
        if (BlockInfo.rotate == 1 || BlockInfo.rotate == 2) entry = 2;

        row_shift = BlockInfo.addr[entry][0] - BlockInfo.addr[entry][1];
        if (BlockInfo.rotate == 0)   {
            //初期位置の場合
            column_shift = -row_shift + 1;
        } else if (BlockInfo.rotate == 2)   {
            //初期位置から２回転させた場合
            column_shift = -row_shift - 1;
        } else  {
            column_shift = -row_shift;
        }

        for (let i = 0; i < 4; i++) {
            row_addr[i] += row_shift;
            column_addr[i] += column_shift;
            collision += field[row_addr[i]][column_addr[i]];
        }
        BlockInfo.rotate += 1;
        if (BlockInfo.rotate == 4) BlockInfo.rotate = 0;

    } else  {
        //テトリミノがTETRIS以外の場合
        for(let i = 0;i < 4;i++)    {
            row_addr[i] = BlockInfo.addr[1][0] - BlockInfo.addr[1][1] + BlockInfo.addr[i][1];
            column_addr[i] = BlockInfo.addr[1][1] + BlockInfo.addr[1][0] - BlockInfo.addr[i][0];
            collision += field[row_addr[i]][column_addr[i]];
        }
    }

    //衝突
    if(collision == 0)  {
        //アドレスの更新
        if (BlockInfo.type != SQUARE)    {
            // SQUAREは回転させない
            for(let i = 0; i < 4; i++)  {
                BlockInfo.addr[i][0] = row_addr[i];
                BlockInfo.addr[i][1] = column_addr[i];
            }
        }
    }
    console_debug();
    draw_block();
}

function rotate_counter_clockwise() {
    let entry;
    let row_shift, column_shift;
    let collision = 0;
    let row_addr = new Array(4);
    let column_addr = new Array(4);

    //衝突の検査
    if (BlockInfo.type == TETRIS)   {
        for (let i = 0; i < 4; i++) {
            row_addr[i] = BlockInfo.addr[i][1];
            column_addr[i] = BlockInfo.addr[i][0];
        }

        if (BlockInfo.rotate == 0 || BlockInfo.rotate == 3) entry = 1;
        if (BlockInfo.rotate == 1 || BlockInfo.rotate == 2) entry = 2;

        column_shift = BlockInfo.addr[entry][1] - BlockInfo.addr[entry][0];

        if (BlockInfo.rotate == 1)   {
            //初期位置から1回転させた場合
            row_shift = -column_shift - 1;
        } else if (BlockInfo.rotate == 3)   {
            //初期位置から3回転させた場合
            row_shift = -column_shift + 1;
        } else  {
            row_shift = -column_shift;
        }

        for (let i = 0; i < 4; i++) {
            row_addr[i] += row_shift;
            column_addr[i] += column_shift;
            collision += field[row_addr[i]][column_addr[i]];
        }
        BlockInfo.rotate -= 1;
        if (BlockInfo.rotate == -1) BlockInfo.rotate = 3;

    } else  {
        //テトリミノがTETRIS以外の場合
        for(let i = 0;i < 4;i++)    {
            row_addr[i] = BlockInfo.addr[1][1] + BlockInfo.addr[1][0] - BlockInfo.addr[i][1];
            column_addr[i] = BlockInfo.addr[1][1] - BlockInfo.addr[1][0] + BlockInfo.addr[i][0];
            collision += field[row_addr[i]][column_addr[i]];
        }
    }

    if(collision == 0)  {
        //アドレスの更新
        if (BlockInfo.type != SQUARE)    {
            // SQUAREは回転させない
            for(let i = 0; i < 4; i++)  {
                BlockInfo.addr[i][0] = row_addr[i];
                BlockInfo.addr[i][1] = column_addr[i];
            }
        }
    }
    console_debug();
    draw_block();
}

function hard_drop()    {
    let row, column;
    let collision_val = 0;

    while(true)  {
        //衝突値の計算
        for(let i = 0; i < 4; i++)  {
            row = BlockInfo.addr[i][0] + 1;
            column = BlockInfo.addr[i][1];
            collision_val += field[row][column];
        }

        // 衝突検査
        if(collision_val == 0)    {
            //Update adress
            for(let i = 0; i < 4; i++)  {
                BlockInfo.addr[i][0] += 1;
            }
        } else  {           //衝突:
            for(let i = 0; i < 4; i++)  {   //fix block
                row = BlockInfo.addr[i][0];
                column = BlockInfo.addr[i][1];
                field[row][column] = BlockInfo.color;
            }
            break;
        }
    }
    console_debug();
    draw_block();
}

function bitblock(block_type, x, y)  {
    ctx.beginPath();
    ctx.rect(x, y, BlockSize, BlockSize);

    if (block_type == TETRIS)   {
        ctx.fillStyle = "rgb(0, 191, 255)"; //skyblue
    } else if (block_type == SQUARE)  {
        ctx.fillStyle = "rgb(255, 204, 0)"; //yellow
    } else if (block_type == KEY1)     {
        ctx.fillStyle = "rgb(124, 252, 0)"; //lightgreen
    } else if (block_type == KEY2)     {
        ctx.fillStyle = "rgb(204, 0, 0)";   //reda
    } else if (block_type == L1)       {
        ctx.fillStyle = "rgb(255, 102, 0)"; //orenge
    } else if (block_type == L2)       {
        ctx.fillStyle = "rgb(0, 51, 204))"; //blue
    } else if (block_type == T)        {
        ctx.fillStyle = "rgb(148, 0, 211)"; //purple
    } else  {
        ctx.fillStyle = "rgb(255,255,255)";
    }

    ctx.fill();
    ctx.strokeStyle = "rgb(211, 211, 211)";
    ctx.stroke();
    ctx.closePath();
}

function draw_block()   {
    let x,y;
    let block_type;
    ctx.clearRect(0, 0, canvas.width, canvas.height); //描画の削除
    for (let row = 2; row < ROW + 2; row++) {
        for (let column = 2; column < COLUMN + 2; column++)   {
            if (field[row][column] != 0)    {
                x = BlockSize * (column - 2);
                y = BlockSize * (row - 2);
                block_type = field[row][column];
                bitblock(block_type, x, y);
            }
        }
    }
    for (let i = 0; i < 4; i++) {
        x = BlockSize * (BlockInfo.addr[i][1] - 2);
        y = BlockSize * (BlockInfo.addr[i][0] - 2);
        bitblock(BlockInfo.type, x, y);
    }
}

function console_debug()    {
    if (debug)  {
        let debug_ary = (new Array(ROW+4)).fill(0);
        debug_ary.forEach((_, i) => {
            debug_ary[i] = (new Array(COLUMN)).fill(0);
        });
        for (let i = 2; i < ROW+2; i++) {
            for (let j = 2; j < COLUMN+2; j++)  {
                debug_ary[i][j-2] = field[i][j];
            }
        }
        
        for (let i = 0; i < 4; i++) {
            let r = BlockInfo.addr[i][0];
            let c = BlockInfo.addr[i][1]-2;
            debug_ary[r][c] = BlockInfo.type;
        }
        
        
        for (let i = 2; i < ROW+2; i++)   {
            console.log(debug_ary[i]);
        }
        console.log(" ");
    }
}
