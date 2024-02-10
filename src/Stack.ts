import GridSystem from "./GridSystem";
import { Props } from "./Interface";

class Stack {

    statusList: Props[][];  // gls中所有的元素放到stackList中
    pointer: number;  // 指针,下标
    gls: GridSystem;

    constructor() {
        this.statusList = []
        this.pointer = this.statusList.length - 1;
        this.gls = GridSystem.Gls;
        this.record();
    }

    record() {
        // console.log("记录一下");
        let featurePropsArr: Props[] = [];
        while (this.pointer != this.statusList.length - 1) {
            //如果push前指针不指向末尾, 即被undo.restore过, 那么就先删除pointer之后的记录
            this.statusList.pop();
        }
        this.gls.features.forEach(f => {
            let fProps = this.gls.recordFeatureProps(f);
            featurePropsArr.push(fProps)
        })
        this.statusList.push(featurePropsArr);
        this.pointer = this.statusList.length - 1;
    }
    // [featuresArr1, featuresArr2, featuresArr3]

    undo() {
        let curFeaturesPropsArr = this.statusList[this.pointer];
        let prevFeaturesPropsArr = this.statusList[this.pointer - 1];
        console.log(curFeaturesPropsArr, prevFeaturesPropsArr);
        
        if (!prevFeaturesPropsArr) return;
        if (curFeaturesPropsArr.length >= prevFeaturesPropsArr.length) {  // 有修改或是新增元素,撤销需要修改或删除元素
            curFeaturesPropsArr.forEach(cs => {
                let ps = prevFeaturesPropsArr.find(p => p.id === cs.id);
                if (ps) {
                    let id = ps.id;
                    let feature = this.gls.features.find(f => id === f.id);
                    if (feature) {
                        this.gls.setFeatureProps(feature, ps);
                    }
                } else {  // 说明之前没有这个元素，撤销需要删除该元素
                    this.gls.removeFeature(cs.id, false);
                }
            })
        } else {  // 有元素被删除了，撤销需要恢复创建之前的元素
            prevFeaturesPropsArr.forEach(ps => {
                let cs = curFeaturesPropsArr.find(cs => cs.id === ps.id);
                if (!cs) {
                    this.gls.createFeature(ps);
                }
            })
        }
        this.pointer--;
    }

    restore() {
        let curFeaturesPropsArr = this.statusList[this.pointer];
        let nextFeaturesPropsArr = this.statusList[this.pointer + 1];
        if (!nextFeaturesPropsArr) return;
        if (curFeaturesPropsArr.length > nextFeaturesPropsArr.length) {  // 需要删除
            curFeaturesPropsArr.forEach(cs => {
                let ns = nextFeaturesPropsArr.find(ns => cs.id === ns.id);
                if (!ns) {
                    this.gls.removeFeature(cs.id, false);
                }
            })
        } else {
            nextFeaturesPropsArr.forEach(ns => {
                let cs = curFeaturesPropsArr.find(c => c.id === ns.id);
                if (cs) {
                    let id = ns.id;
                    let feature = this.gls.features.find(f => id === f.id);
                    if (feature) {
                        this.gls.setFeatureProps(feature, ns);
                    }
                } else {  // 说明之前没有这个元素，恢复需要重新创建这些元素
                    this.gls.createFeature(ns)
                }
            })
        }
        this.pointer++;
    }

    destory() {
        this.statusList = [];
        this.pointer = 0;
    }
}

export default Stack