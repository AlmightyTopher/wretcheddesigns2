"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var admin = require("firebase-admin");
var fs = require("fs");
var path = require("path");
// Initialize Firebase Admin SDK
// Ensure you have set the GOOGLE_APPLICATION_CREDENTIALS environment variable
// pointing to your service account key file.
if (!admin.apps.length) {
    admin.initializeApp({
    // credential: admin.credential.applicationDefault(), // Use this if running locally with GOOGLE_APPLICATION_CREDENTIALS
    // databaseURL: 'YOUR_DATABASE_URL', // Replace with your database URL if needed
    });
}
var db = admin.firestore();
var productsFilePath = path.join(__dirname, '../data/products.json');
function migrateProductsToFirestore() {
    return __awaiter(this, void 0, void 0, function () {
        var productsData, productsCollectionRef, _i, _a, product, error_1, _b, _c, product, error_2, error_3;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 13, , 14]);
                    productsData = JSON.parse(fs.readFileSync(productsFilePath, 'utf-8'));
                    productsCollectionRef = db.collection('products');
                    if (!(productsData.cups && Array.isArray(productsData.cups))) return [3 /*break*/, 6];
                    _i = 0, _a = productsData.cups;
                    _d.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 6];
                    product = _a[_i];
                    _d.label = 2;
                case 2:
                    _d.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, productsCollectionRef.doc(product.id).set(product)];
                case 3:
                    _d.sent();
                    console.log("Migrated cup product: ".concat(product.name, " with ID: ").concat(product.id));
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _d.sent();
                    console.error("Error migrating cup product ".concat(product.name, ":"), error_1);
                    return [3 /*break*/, 5];
                case 5:
                    _i++;
                    return [3 /*break*/, 1];
                case 6:
                    if (!(productsData.apparel && Array.isArray(productsData.apparel))) return [3 /*break*/, 12];
                    _b = 0, _c = productsData.apparel;
                    _d.label = 7;
                case 7:
                    if (!(_b < _c.length)) return [3 /*break*/, 12];
                    product = _c[_b];
                    _d.label = 8;
                case 8:
                    _d.trys.push([8, 10, , 11]);
                    return [4 /*yield*/, productsCollectionRef.doc(product.id).set(product)];
                case 9:
                    _d.sent();
                    console.log("Migrated apparel product: ".concat(product.name, " with ID: ").concat(product.id));
                    return [3 /*break*/, 11];
                case 10:
                    error_2 = _d.sent();
                    console.error("Error migrating apparel product ".concat(product.name, ":"), error_2);
                    return [3 /*break*/, 11];
                case 11:
                    _b++;
                    return [3 /*break*/, 7];
                case 12:
                    console.log('Product migration to Firestore complete.');
                    return [3 /*break*/, 14];
                case 13:
                    error_3 = _d.sent();
                    console.error('Error reading products.json or migrating data:', error_3);
                    return [3 /*break*/, 14];
                case 14: return [2 /*return*/];
            }
        });
    });
}
migrateProductsToFirestore();
