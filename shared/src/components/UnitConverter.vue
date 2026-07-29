<script setup lang="ts">
import { ref, computed } from 'vue';

import '@material/web/textfield/outlined-text-field.js';
import '@material/web/select/outlined-select.js';
import '@material/web/select/select-option.js';

import { convertUnits, type Unit, type UnitType, type ConvertObject, LENGTH_UNITS, AREA_UNITS, VOLUME_UNITS, TEMPERATURE_UNITS, TIME_UNITS, DATA_UNITS, MASS_UNITS, SPEED_UNITS, ENERGY_UNITS } from '../utilities/calculator_utils';
import { vibrate } from '../utilities/vibrate';

type ConvertType = "from" | "to";

const unitTypeMap: Record<UnitType, Unit[]> = {
    "length": LENGTH_UNITS,
    "area": AREA_UNITS,
    "volume": VOLUME_UNITS,
    "temperature": TEMPERATURE_UNITS,
    "time": TIME_UNITS,
    "data": DATA_UNITS,
    "mass": MASS_UNITS,
    "speed" : SPEED_UNITS,
    "energy" : ENERGY_UNITS
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
    <div class="category-selector">
    <md-outlined-select
        class="category-select"
        :value="selectedCategory"
        @change="changeCategory(($event.target as HTMLSelectElement).value as UnitType)"
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
    <div class="converter-wrapper" style="height: 480px">
        <div class="unit-container">
            <h1>From</h1>
            <div class="input-group">
                <md-outlined-text-field v-model="inputtedNumber" type="number" @input="convert()"></md-outlined-text-field>
                <md-outlined-select class="unit-select">
                    <md-select-option v-for="unit in availableUnits" :value="`${unit.type}-${unit.symbol}`" @click="selectUnit(unit, 'from')">
                        <p slot="headline">{{ unit.name }} ({{ unit.symbol }})</p>
                    </md-select-option>
                </md-outlined-select>
            </div>
        </div>
        <div class="unit-container">
            <h1>To</h1>
            <div class="input-group">
                <md-outlined-text-field v-model="outputtedNumber" type="number" readonly></md-outlined-text-field>
                <md-outlined-select class="unit-select">
                    <md-select-option v-for="unit in availableUnits" :value="`${unit.type}-${unit.symbol}`" @click="selectUnit(unit, 'to')">
                        <p slot="headline">{{ unit.name }} ({{ unit.symbol }})</p>
                    </md-select-option>
                </md-outlined-select>
            </div>
        </div>
    </div>
</template>

<style scoped>
.converter-wrapper {
    display: flex;
    flex-direction: row;
    align-items: stretch;
    justify-content: center;
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
    display: flex;
    flex-direction: column;
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
    --md-outlined-select-text-field-container-shape: 25px;
}

@media (max-width: 768px) {
    .converter-wrapper {
        display: flex;
        flex-direction: row;
        align-items: stretch;
        justify-content: center;
        gap: 10px;
        flex-wrap: wrap;
        padding: 0;
    }
}
</style>