import Parser from './parser';
import { evaluate } from './interpreter';

import { disableWakeLock, requestWakeLock } from './wakelock';
import type { RuntimeVal } from './values';
import { type Theme, themeFromSourceColor, argbFromHex, applyTheme } from '@material/material-color-utilities';

export type CalculatorType = 'standard' | 'scientific' | 'conversion' | 'history' | 'settings' | 'install';
export type UnitType = "length" | "area" | "volume" | "temperature" | "time" | "data" | "mass" | "speed" | "energy";

export interface ResultObject {
    value: string;
}

export interface ResultItem {
    value: string;
    index: number;
    pinned: boolean;
}

export interface Unit {
    name: string;
    type: UnitType;
    symbol: string;
    toBase: (value: number) => number;
    fromBase: (value: number) => number;
}

export interface ConvertObject {
    value: string;
    unit: Unit;
}

export interface Settings {
    stayAwake: boolean;
    theme: string;
}

export interface HistoryObject {
    equation: string;
    result: number;
    note?: string;
    date: number;
}

export const LENGTH_UNITS: Unit[] = [
    linearUnit("Millimeters", "length", "mm", 0.001),
    linearUnit("Centimeters", "length", "cm", 0.01),
    linearUnit("Decimeters", "length", "dm", 0.1),
    linearUnit("Meters", "length", "m", 1),
    linearUnit("Kilometers", "length", "km", 1000),
    linearUnit("Inches", "length", "in", 0.0254),
    linearUnit("Feet", "length", "ft", 0.3048),
    linearUnit("Yards", "length", "yd", 0.9144),
    linearUnit("Miles", "length", "mi", 1609.344)
];

export const AREA_UNITS: Unit[] = [
    linearUnit("Square Millimeters", "area", "mm²", 1e-6),
    linearUnit("Square Centimeters", "area", "cm²", 0.0001),
    linearUnit("Square Decimeters", "area", "dm²", 0.01),
    linearUnit("Square Meters", "area", "m²", 1),
    linearUnit("Square Kilometers", "area", "km²", 1_000_000),
    linearUnit("Square Inches", "area", "in²", 0.00064516),
    linearUnit("Square Feet", "area", "ft²", 0.09290304),
];

export const VOLUME_UNITS: Unit[] = [
    linearUnit("Cubic Millimeters", "volume", "mm³", 1e-9),
    linearUnit("Cubic Centimeters", "volume", "cm³", 1e-6),
    linearUnit("Cubic Decimeters", "volume", "dm³", 0.001),
    linearUnit("Cubic Meters", "volume", "m³", 1),
    linearUnit("Cubic Kilometers", "volume", "km³", 1e9),
    linearUnit("Cubic Inches", "area", "in³", 0.000016387064),
    linearUnit("Cubic Feet", "area", "ft³", 0.028316846592),
];

export const TEMPERATURE_UNITS: Unit[] = [
    {
        name: "Degrees Celsius",
        type: "temperature",
        symbol: "°C",
        toBase: (v) => v + 273.15,
        fromBase: (v) => v - 273.15,
    },
    {
        name: "Degrees Fahrenheit",
        type: "temperature",
        symbol: "°F",
        toBase: (v) => (v - 32) * 5/9 + 273.15,
        fromBase: (v) => (v - 273.15) * 9/5 + 32,
    },
    {
        name: "Kelvin",
        type: "temperature",
        symbol: "K",
        toBase: (v) => v,
        fromBase: (v) => v,
    },
];

export const TIME_UNITS: Unit[] = [
    linearUnit("Milliseconds", "time", "ms", 0.001),
    linearUnit("Seconds", "time", "s", 1),
    linearUnit("Minutes", "time", "min", 60),
    linearUnit("Hours", "time", "h", 3_600),
    linearUnit("Days", "time", "day", 86_400),
    linearUnit("Weeks", "time", "week", 604_800),
    linearUnit("Years", "time", "yr", 31_557_600) // 365.25 days (Julian year)
];

export const DATA_UNITS: Unit[] = [
    linearUnit("Bits", "data", "b", 1 / 8),
    linearUnit("Kilobits", "data", "Kb", 125),
    linearUnit("Megabits", "data", "Mb", 125_000),
    linearUnit("Gigabits", "data", "Gb", 125_000_000),
    linearUnit("Terabits", "data", "Tb", 125_000_000_000),

    linearUnit("Bytes", "data", "B", 1),
    linearUnit("Kilobytes", "data", "KB", 1_000),
    linearUnit("Megabytes", "data", "MB", 1_000_000),
    linearUnit("Gigabytes", "data", "GB", 1_000_000_000),
    linearUnit("Terabytes", "data", "TB", 1_000_000_000_000)
];

export const MASS_UNITS: Unit[] = [
    linearUnit("Milligrams", "mass", "mg", 0.001),
    linearUnit("Grams", "mass", "g", 1),
    linearUnit("Kilograms", "mass", "kg", 1_000),
    linearUnit("Metric Tonne", "mass", "t", 1_000_000),
    linearUnit("Ounces", "mass", "oz", 28.349523125),
    linearUnit("Pounds", "mass", "lb", 453.59237),
    linearUnit("Stone", "mass", "st", 6_350.29318),
    linearUnit("Short Ton", "mass", "US ton", 907_184.74),
    linearUnit("Long Ton", "mass", "LT", 1_016_046.91),
]

export const SPEED_UNITS: Unit[] = [
    linearUnit("Millimeters per second", "speed", "mm/s", 0.001),
    linearUnit("Centimeters per second", "speed", "cm/s", 0.01),
    linearUnit("Meters per second", "speed", "m/s", 1),
    linearUnit("Kilometers per second", "speed", "km/s", 1000),
    linearUnit("Kilometers per hour", "speed", "km/h", 0.2777777778),
    linearUnit("Feet per second", "speed", "ft/s", 0.3048),
    linearUnit("Miles per hour", "speed", "mph", 0.44704),
    linearUnit("Knots", "speed", "kn", 0.514444),
    linearUnit("Mach", "speed", "Ma", 340.29), // Approx. at sea level, 15°C
]

export const ENERGY_UNITS: Unit[] = [
    linearUnit("Joules", "energy", "J", 1),
    linearUnit("Kilojoules", "energy", "kJ", 1_000),
    linearUnit("Megajoules", "energy", "MJ", 1_000_000),
    linearUnit("Gigajoules", "energy", "GJ", 1_000_000_000),
    linearUnit("Watt-hours", "energy", "Wh", 3_600),
    linearUnit("Kilowatt-hours", "energy", "kWh", 3_600_000),
    linearUnit("Megawatt-hours", "energy", "MWh", 3_600_000_000),
    linearUnit("Calories", "energy", "cal", 4.184),
    linearUnit("Kilocalories", "energy", "kcal", 4_184),
    linearUnit("Electronvolts", "energy", "eV", 1.602176634e-19),
]

function linearUnit(name: string, type: UnitType, symbol: string, ofbase: number): Unit {
    return {
        name,
        type,
        symbol,
        toBase: (v) => v * ofbase,
        fromBase: (v) => v / ofbase,
    };
}

function replaceOtherOperators(equation: string): string {
    const operatorMap = {
        '×': '*',
        '✕': '*',
        '⋅': '*',
        '÷': '/',
        '−': '-',
        '–': '-',
        '—': '-'
    };

    type OtherOperators = keyof typeof operatorMap;

    const pattern = new RegExp(`[${Object.keys(operatorMap)}]`, 'g');

    const formattedEquation = equation.replace(pattern, match => operatorMap[match as OtherOperators]);

    return formattedEquation;
}

export function calculate(equation: string[] | string): number | string {
    equation = replaceOtherOperators(Array.isArray(equation) ? equation.join("") : equation);

    let result: RuntimeVal;

    try {
        const parser = new Parser();
        const ast = parser.produceAST(equation);
        console.log("Produced AST:", ast);

        result = evaluate(ast);
        console.log("Program:", result);

        return result.value;
    } catch (error) {
        console.error("Error while calculating:", error);
        
        if (error instanceof Error) {
            return error.message;
        } else {
            return String(error);
        }
    }
}

function capitalizeMode(mode: CalculatorType): string {
    return mode.charAt(0).toUpperCase() + mode.slice(1);
}

export function setCalculatorMode(mode: CalculatorType) {
    if (mode === window.history.state?.mode) return;

    const url = new URL(window.location.href);
    url.searchParams.set('mode', mode);

    window.history.pushState({ mode: mode }, '', url.toString());

    document.title = `${capitalizeMode(mode)} | Calculite`;
}

export function getCalculatorMode(): CalculatorType {
    const searchParams = new URLSearchParams(window.location.search);
    const calculatorMode = searchParams.get('mode');

    let returnedMode: CalculatorType;

    switch (calculatorMode) {
        case "standard":
            returnedMode = "standard";
            break;
        case "scientific":
            returnedMode = "scientific";
            break;
        case "conversion":
            returnedMode = "conversion";
            break;
        case "settings":
            returnedMode = "settings";
            break;
        default:
            returnedMode = "standard";
            break;
    }

    document.title = `${capitalizeMode(returnedMode)} | Calculite`;

    return returnedMode;
}

export function saveResults(results: string[]) {
    localStorage.setItem('results', JSON.stringify(results.slice(0, 10)));
}

export function fetchResults(): string[] {
    const results = localStorage.getItem('results');

    if (!results) {
        return [];
    }

    return JSON.parse(results).slice(0, 10);
}

export function convertUnits(from: ConvertObject, to: Unit): number {
    const value = parseFloat(from.value);

    const valueInBase = from.unit.toBase(value);
    return to.fromBase(valueInBase);
}

export function fetchPinnedResults(): string[] {
    const results = localStorage.getItem('pinned_results');

    if (!results) {
        return [];
    }

    return JSON.parse(results).slice(0, 10);
}

export function pinResult(result: string) {
    console.log('Pinning result:', result);
    const pinnedItems: string[] = JSON.parse(localStorage.getItem('pinned_results') || "[]");
    if (!pinnedItems.includes(result)) pinnedItems.unshift(result);
    localStorage.setItem("pinned_results", JSON.stringify(pinnedItems.slice(0, 10)));
}

export function unpinResult(result: string, index: number) {
    console.log('Unpinning result:', result, index);
    const pinnedItems: string[] = JSON.parse(localStorage.getItem('pinned_results') || "[]");
    pinnedItems.splice(index, 1);
    localStorage.setItem("pinned_results", JSON.stringify(pinnedItems));

    const allResults: string[] = fetchResults();
    if (!allResults.includes(result)) allResults.unshift(result);
    localStorage.setItem("results", JSON.stringify(allResults.slice(0, 10)));
}

export function deleteResult(index: number, pinned: boolean) {
    console.log('Deleting result:', index, pinned);
    const key = pinned ? "pinned_results" : "results";
    const results: string[] = JSON.parse(localStorage.getItem(key) || "[]");
    results.splice(index, 1);
    localStorage.setItem(key, JSON.stringify(results));
}

export async function toggleStayAwake(enabled: boolean) {
    console.log('Enabled:', enabled);

    const settings = fetchSettings();

    settings.stayAwake = enabled;

    localStorage.setItem('settings', JSON.stringify(settings));

    if (enabled === true) {
        await requestWakeLock();
    } else {
        disableWakeLock();
    }
}

export function fetchSettings(): Settings {
    const fetchedSettings = localStorage.getItem('settings');

    console.log(fetchedSettings);

    const settings: Partial<Settings> = JSON.parse(fetchedSettings || '{}');

    const defaultSettings: Settings = {
        stayAwake: false,
        theme: '#006a60',
    };

    if (!fetchedSettings) {
        localStorage.setItem('settings', JSON.stringify(defaultSettings));

        return defaultSettings;
    }

    Object.assign(settings, { ...defaultSettings, ...settings });

    return settings as Settings;
}

export function getHistory(): HistoryObject[] {
    const history: HistoryObject[] = JSON.parse(localStorage.getItem('history') || '[]');
    return history;
}

export function saveToHistory(historyObject: HistoryObject) {
    const currentHistory = getHistory();
    currentHistory.unshift(historyObject);
    localStorage.setItem('history', JSON.stringify(currentHistory));
}

export function setDocumentTheme(inputSeed: string) {
    console.log('Input seed:', inputSeed);
    const theme = themeFromSourceColor(argbFromHex(inputSeed));
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(theme, { target: document.body, dark: systemDark });
}

export function getTheme(): string {
    const seed: string = fetchSettings().theme;
    return seed;
}

export function setTheme(inputSeed: string) {
    setDocumentTheme(inputSeed);
    const settings = fetchSettings();
    settings.theme = inputSeed;
    localStorage.setItem('settings', JSON.stringify(settings));
}