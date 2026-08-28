<script setup lang="ts">
import { ref, computed } from 'vue';

import '@material/web/textfield/outlined-text-field.js';
import '@material/web/select/outlined-select.js';
import '@material/web/select/select-option.js';

import { convertUnits, type Unit, type UnitType, type ConvertObject, LENGTH_UNITS, AREA_UNITS, VOLUME_UNITS, TEMPERATURE_UNITS, TIME_UNITS, DATA_UNITS } from '../utilities/calculator_utils';
import { vibrate } from '../utilities/vibrate';
import { M3eSelectElement } from '@m3e/web/select';

type ConvertType = "from" | "to";

const unitTypeMap: Record<UnitType, Unit[]> = {
    "length": LENGTH_UNITS,
    "area": AREA_UNITS,
    "volume": VOLUME_UNITS,
    "temperature": TEMPERATURE_UNITS,
    "time": TIME_UNITS,
    "data": DATA_UNITS,
};

const categories = Object.keys(unitTypeMap) as UnitType[];
const selectedCategory = ref<UnitType>("length");
const availableUnits = computed(() => unitTypeMap[selectedCategory.value]);
const inputtedNumber = ref<string>("");
const outputtedNumber = ref<string>("");
const selectedUnits: Record<ConvertType, Unit | null> = { from: null, to: null };

function selectUnit(selectedUnit: Unit, convertType: ConvertType) {
    vibrate([6]);

    selectedUnits[convertType] = selectedUnit;

    convert();
}

function changeCategory(category: UnitType) {
    vibrate([6]);
    selectedCategory.value = category;

    selectedUnits.from = null;
    selectedUnits.to = null;

    outputtedNumber.value = "";
    convert()
}

function convert() {
    if (inputtedNumber.value === "" || selectedUnits["from"] === null || selectedUnits["to"] === null) {
        return;
    }

    const objectToConvert: ConvertObject = { value: inputtedNumber.value, unit: selectedUnits["from"] };

    const output: number = convertUnits(objectToConvert, selectedUnits["to"]);
    console.log("Converted:", output);
    if (outputtedNumber) {outputtedNumber.value = output.toString();} 
    
}
</script>


<template>
    <div class="converter-wrapper">
        <div class="category-selector">
            <md-outlined-select
                label="Select Category"
                class="category-select"
                :value="selectedCategory"
                @change="changeCategory(($event.target as M3eSelectElement).value as UnitType)"
            >
                <md-select-option
                    v-for="category in categories"
                    :key="category"
                    :value="category"
                >
                    <p slot="headline">
                        {{ category.charAt(0).toUpperCase() + category.slice(1) }}
                    </p>
                </md-select-option>
            </md-outlined-select>
        </div>  
            <div class="unit-container">
                <h1>From</h1>
                <div class="input-group">
                    <md-outlined-text-field v-model="inputtedNumber" type="number" label="Enter value" @input="convert()"></md-outlined-text-field>
                    <md-outlined-select class="unit-select" label="Unit">
                        <md-select-option v-for="unit in availableUnits" :value="`${unit.type}-${unit.symbol}`" @click="selectUnit(unit, 'from')">
                            <p slot="headline">{{ unit.name }} ({{ unit.symbol }})</p>
                        </md-select-option>
                    </md-outlined-select>
                </div>
            </div>
            <div class="unit-container">
                <h1>To</h1>
                <div class="input-group">
                    <md-outlined-text-field v-model="outputtedNumber" type="number" label="Result" readonly></md-outlined-text-field>
                    <md-outlined-select class="unit-select" label="Unit">
                        <md-select-option v-for="unit in availableUnits" :value="`${unit.type}-${unit.symbol}`" @click="selectUnit(unit, 'to')">
                            <p slot="headline">{{ unit.name }} ({{ unit.symbol }})</p>
                        </md-select-option>
                    </md-outlined-select>
                </div>
            </div>
        </div>
</template>

<style scoped>

.category-selector{
    display: flex;
    flex-direction: column;
    align-items: normal;
    gap: 0;
    height: fit-content;
    
}

.category-select {
    padding-top: 10px;
    padding-bottom: 10px;
    text-align: center;
    text-overflow: ellipsis;
    width: fit-content;
}

.converter-wrapper {
    display: flex;
    flex-direction: row;
    align-items:flex-start;
    justify-content: center;
    justify-self: center;
    gap: 10px;
    flex-wrap: nowrap;
    padding: 0;
    width: 90vw;
}

.input-group {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 10px;
}

.unit-container {
    display: grid;
    align-items: center;
    justify-content: center;
    text-align: center;
    background-color: var(--md-sys-color-primary-container);
    color: var(--md-sys-color-on-primary-container);
    padding: 20px;
    box-sizing: border-box;
    border-radius: 25px;
    --md-outlined-text-field-container-shape: 25px;
    flex: 1;
}

.unit-select {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    --md-outlined-select-text-field-container-shape: 25px;
}


@media (max-width: 500px) {
    .converter-wrapper {
        width: fit-content;
        height: auto;
        display: grid;
        grid-template-rows: auto auto;
        justify-content: center;
        padding: 20px;
        grid-auto-flow: dense;
        align-content: start;
    }
    .input-group {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 10px;
    }
}
</style>