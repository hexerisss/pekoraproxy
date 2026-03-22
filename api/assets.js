async function getCreatedItemsOnly(userId) {
    let cursor = "";
    const created = [];

    do {
        const res = await fetch(`https://www.pekora.zip/users/inventory/list-json?userId=${userId}&assetTypeId=2,11,12&cursor=${cursor}&itemsPerPage=100`);
        const json = await res.json();

        for (const item of json.data) {
            if (item.creatorTargetId === parseInt(userId) && item.creatorType === "User") {
                created.push(item);
            }
        }

        cursor = json.nextPageCursor || "";
    } while (cursor);

    return created;
}
