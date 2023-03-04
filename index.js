import fs from 'fs'
import dotenv from 'dotenv'
import { getDestinyManifestComponent } from 'oodestiny/manifest/index.js'
import { getDestinyManifest } from 'oodestiny/endpoints/Destiny2/index.js'

/**
 * @typedef {import('oodestiny/schemas').DestinyInventoryItemDefinition} DestinyInventoryItemDefinition
 */

main();

async function main() {
    dotenv.config()
    const defs = await downloadDefinitions()
    await process(defs)
}

/**
 * @returns {Promise<Record<number,DestinyInventoryItemDefinition>>}
 */
async function downloadDefinitions() {
    const { Response: manifest } = await getDestinyManifest()
    return await getDestinyManifestComponent({
        destinyManifest: manifest,
        tableName: 'DestinyInventoryItemDefinition',
        language: 'en'
    })
}

/**
 * @param {Record<number,DestinyInventoryItemDefinition>} items 
 * @returns 
 */
async function process(items) {
    const emblems = Object.entries(items)
        .filter(([_, def]) => (def.itemTypeDisplayName === "Emblem"))
        .map(([hash, def]) => [hash, def.secondarySpecial])
    const weaponBuckets = [/* kinetic */ 1498876634,
                            /* energy */ 2465295065,
                            /* power */ 953998645]
    const weapons = Object.entries(items)
        .filter(([_, def]) => (weaponBuckets.includes(def.inventory?.bucketTypeHash)))
        .map(([hash, def]) => [hash, {
            name: def.displayProperties.name,
            icon: def.displayProperties.icon,
            type: def.itemSubType
        }])

    fs.writeFileSync("./lib/emblems.json", JSON.stringify(Object.fromEntries(emblems), null, 2))
    fs.writeFileSync("./lib/weapons.json", JSON.stringify(Object.fromEntries(weapons), null, 2))
}
