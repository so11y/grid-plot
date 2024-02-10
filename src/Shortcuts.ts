// 快捷键， 组合键

export default class Shortcuts {

    keyCodeMap = new Map([
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
    ]);

    isPreventDefault: boolean
    keyNames: string[] | string
    callback: Function
    clickType: string;

    constructor(keyNames: string[] | string, callback: Function, clickType = 'keydown', isPreventDefault = false) {
        this.destroy();
        this.isPreventDefault = isPreventDefault;
        this.keyNames = keyNames;
        this.callback = callback;
        this.clickType = clickType;
        this.initEventListener()
    }

    initEventListener() {
        document.addEventListener(this.clickType, this.handleKey)
    }

    destroy() {
        document.removeEventListener(this.clickType, this.handleKey);
    }

    handleKey = (e: any) => {
        console.log(this.clickType);
        this.isPreventDefault && e.preventDefault();  // 是否阻止默认行为
        let conditions = []

        if (Array.isArray(this.keyNames)) {  // 数组是组合键
            this.keyNames.forEach(code => {
                let strCode = code.toString().toUpperCase();
                if (this.clickType == "keydown") {
                    switch (strCode) {
                        case "CTRL":
                            conditions.push(e.ctrlKey)
                            break;
                        case "SHIFT":
                            conditions.push(e.shiftKey)
                            break;
                        case "ALT":
                            conditions.push(e.altKey)
                            break;
                        default:
                            conditions.push(this.keyCodeMap.get(strCode) == e.keyCode)
                            break;
                    }
                } else {
                    conditions.push(this.keyCodeMap.get(strCode) == e.keyCode)
                }
            })
        } else {
            let strCode = this.keyNames.toString().toUpperCase();
            if (strCode == e.keyCode) {
                conditions.push(true);
            }
        }

        if (conditions.every(item => item)) {
            this.callback && this.callback()
        }
    }

}