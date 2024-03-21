// 快捷键， 组合键

interface MyEvent {
    cb: Function,
    ctrl: boolean
    shift: boolean
    alt: boolean
    mainKey: string
}

const keyCodeMap = new Map([
    ["0", 48],
    ["1", 49],
    ["2", 50],
    ["3", 51],
    ["4", 52],
    ["5", 53],
    ["6", 54],
    ["7", 55],
    ["8", 56],
    ["9", 57],
    ["A", 65],
    ["B", 66],
    ["C", 67],
    ["D", 68],
    ["E", 69],
    ["F", 70],
    ["G", 71],
    ["H", 72],
    ["I", 73],
    ["J", 74],
    ["K", 75],
    ["L", 76],
    ["M", 77],
    ["N", 78],
    ["O", 79],
    ["P", 80],
    ["Q", 81],
    ["R", 82],
    ["S", 83],
    ["T", 84],
    ["U", 85],
    ["V", 86],
    ["W", 87],
    ["X", 88],
    ["Y", 89],
    ["Z", 90],
    ["UP", 38],
    ["RIGHT", 39],
    ["DOWN", 40],
    ["LEFT", 37],
    ["CTRL", 17],
    ["SHIFT", 16],
    ["ALT", 18],
    ["ENTER", 13],
    ["SPACE", 32],  // 空格键
    ["TAB", 9],  // tab键
    ["CAPSLOACK", 20],
    ["DEL", 46],
    ["DElETE", 46],
    ["ESC", 27],
    ["BACKSPACE", 8],
]);

export default class Shortcuts {

    static isShiftKey = false;
    static isCtrlKey = false;
    static isAltKey = false;
    
    typeArr: MyEvent[] = [];

    constructor() {
        this.initEventListener()
    }

    initEventListener() {
        document.addEventListener('keydown', this.handleDownEvents)
        document.addEventListener('keyup', this.handleUpEvents)
    }

    addEvent(kns: string[] | string, cb: Function) {
        if (!Array.isArray(kns)) {
            kns = [kns]
        }
        let keyNames = kns.map(kn => kn.toString().toUpperCase());
        // if (keyNames.length == 1 && (keyNames[0] === 'CTRL' || keyNames[0] === 'SHIFT' || keyNames[0] === 'ALT')) {
        //     throw new Error("快捷键不能只有CTRL或SHIFT或ALT一个!");
        // }
        // if (keyNames.filter(kn => kn !== 'CTRL' && kn !== 'SHIFT' && kn !== 'ALT').length != 1) {
        //     throw new Error("主键不能有多个!");
        // }
        this.typeArr.push({
            ctrl: keyNames.includes("CTRL"),
            shift: keyNames.includes("SHIFT"),
            alt: keyNames.includes("ALT"),
            mainKey: keyNames.find(ka => ka !== 'CTRL' && ka !== 'SHIFT' && ka !== 'ALT') as string,
            cb,
        })
    }

    handleUpEvents(){
        Shortcuts.isCtrlKey = false;
        Shortcuts.isShiftKey = false;
    }

    handleDownEvents = (e: any) => {
        Shortcuts.isCtrlKey = e.ctrlKey;
        Shortcuts.isShiftKey = e.shiftKey;
        Shortcuts.isAltKey = e.altKey;
        if (e.keyCode != 116 && e.keyCode != 123 && e.keyCode != 8 && e.keyCode != 45) {  // 白名单 f5 
            e.preventDefault();
        }
        this.typeArr.forEach(ta => {
            if (ta.ctrl) {
                if (!e.ctrlKey) {
                    return
                }
            }
            if (ta.shift) {
                if (!e.shiftKey) {
                    return
                }
            }
            if (ta.alt) {
                if (!e.altKey) {
                    return
                }
            }
            if (e.keyCode === keyCodeMap.get(ta.mainKey)) {
                console.log("触发");
                ta.cb()
            }
        })
    }

    destroy() {
        document.removeEventListener('keydown', this.handleDownEvents)
        document.removeEventListener('keyup', this.handleUpEvents)
    }

}