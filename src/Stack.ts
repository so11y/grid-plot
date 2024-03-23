import GridSystem from "./GridSystem";
import { BasicFeature, Props } from "./Interface";
import { isBasicFeature } from "./utils";

class Stack {

    statusList: Props[][] = [];  // gls中所有的元素放到stackList中
    pointer: number = -1;  // 指针,下标
    gls: GridSystem;
    isLocal = true;

    constructor() {
        this.gls = GridSystem.Gls;
        this.record();
    }

    record() {
        const featurePropsArr: Props[] = [];
        while (this.pointer != this.statusList.length - 1) {
            //如果push前指针不指向末尾, 即被undo.restore过, 那么就先删除pointer之后的记录
            this.statusList.pop();
        }
        const features = this.gls.features.filter(f => isBasicFeature(f)) as BasicFeature[]
        features.forEach(f => {
            const fProps = this.gls.recordFeature(f);
            featurePropsArr.push(fProps as Props)
        })
        this.statusList.push(featurePropsArr);
        this.pointer = this.statusList.length - 1;
        if (this.isLocal) { this.gls.save(this.statusList[this.pointer]) }
        // console.log("记录一下", featurePropsArr);
    }
    // [featuresArr1, featuresArr2, featuresArr3]

    undo() {
        console.log(111);

        const curFeaturesPropsArr = this.statusList[this.pointer];
        const prevFeaturesPropsArr = this.statusList[this.pointer - 1];
        if (!prevFeaturesPropsArr) return;
        if (curFeaturesPropsArr.length >= prevFeaturesPropsArr.length) {  // 有修改或是新增元素,撤销需要修改或删除元素
            curFeaturesPropsArr.forEach(cs => {
                const ps = prevFeaturesPropsArr.find(p => p.id === cs.id);
                if (ps) {
                    const id = ps.id;
                    const feature = this.gls.features.find(f => id === f.id);
                    if (feature) {
                        this.gls.modifyFeature(feature as BasicFeature, ps);
                    }
                } else {  // 说明之前没有这个元素，撤销需要删除该元素
                    this.gls.removeFeature(cs.id, false);
                }
            })
        } else {  // 有元素被删除了，撤销需要恢复创建之前的元素
            prevFeaturesPropsArr.forEach(ps => {
                const cs = curFeaturesPropsArr.find(cs => cs.id === ps.id);
                if (!cs) {
                    this.gls.createFeature(ps);
                }
            })
        }
        this.pointer--;
        this.gls.enableBbox(null)
        this.gls.enableSelectArea(false)
        this.gls.features.filter(f => isBasicFeature(f)).forEach(f => f.onresize())
        if (this.isLocal) { this.gls.save(this.statusList[this.pointer]) }
    }

    restore() {
        const curFeaturesPropsArr = this.statusList[this.pointer];
        const nextFeaturesPropsArr = this.statusList[this.pointer + 1];
        if (!nextFeaturesPropsArr) return;
        if (curFeaturesPropsArr.length > nextFeaturesPropsArr.length) {  // 需要删除
            curFeaturesPropsArr.forEach(cs => {
                const ns = nextFeaturesPropsArr.find(ns => cs.id === ns.id);
                if (!ns) {
                    this.gls.removeFeature(cs.id, false);
                }
            })
        } else {
            nextFeaturesPropsArr.forEach(ns => {
                const cs = curFeaturesPropsArr.find(c => c.id === ns.id);
                if (cs) {
                    const id = ns.id;
                    const feature = this.gls.features.find(f => id === f.id);
                    if (feature) {
                        this.gls.modifyFeature(feature as BasicFeature, ns);
                    }
                } else {  // 说明之前没有这个元素，恢复需要重新创建这些元素
                    this.gls.createFeature(ns)
                }
            })
        }
        this.pointer++;
        this.gls.enableBbox(null)
        this.gls.enableSelectArea(false)
        this.gls.features.filter(f => isBasicFeature(f)).forEach(f => f.onresize())
        if (this.isLocal) { this.gls.save(this.statusList[this.pointer]) }
    }

    destory() {
        this.statusList = [];
        this.pointer = 0;
    }
}

export default Stack