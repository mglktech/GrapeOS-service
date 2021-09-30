//const iconWrapper = document.getElementById("iconWrapper");
const icon = async (sc, parent) => {
    if(sc.type === "shortcut" || sc.type === "folder") {
        createShortcut(sc, parent);
    }
    if(sc.type === "icon") {
        createIcon(sc, parent);
    }
}

const populateIconGroup = (iconGroup, parent) => {
    if(!iconGroup.name) {
        iconGroup.name = "No Group";
    }
    const groupContainer = document.createElement("div");
    groupContainer.className = "p-2";
    const spanContainer = document.createElement("div");
    spanContainer.className = "d-flex";
    const spanElement = document.createElement("span");
    spanElement.className = "text-secondary";
    spanElement.innerHTML = `${iconGroup.name}` || "No Group";
    spanContainer.appendChild(spanElement);
    groupContainer.appendChild(spanContainer);
    for(let i of iconGroup.iconData) {
        icon(i, groupContainer);
    }
    parent.appendChild(groupContainer);
}

const createShortcut = (sc, parent) => {
    const iconContainer = document.createElement("div");
    iconContainer.id = `${sc._id}`;
    iconContainer.className = "d-inline-flex flex-column align-items-center p-2 shortcut-container";
    let iconIcon;
if(sc.icon.data.iconType === "img") {
    iconIcon = document.createElement("div");
    iconIcon.className = `shortcut-icon`;
    iconIcon.style = "background: url("+JSON.stringify(sc.icon.data.iconTypeData)+") center / contain no-repeat;";
}
if(sc.icon.data.iconType === "icon") {
    iconIcon = document.createElement("i");
    iconIcon.className = `${sc.icon.data.iconTypeData} d-flex justify-content-center shortcut-icon`;
}
const iconText = document.createElement("span");
    iconText.className = "text-center shortcut-text";
    iconText.innerHTML = sc.name;

    iconContainer.appendChild(iconIcon);
    iconContainer.appendChild(iconText);
    
    parent.appendChild(iconContainer);
}
const createIcon = (sc, parent) => {
    const iconContainer = document.createElement("div");
    iconContainer.id = `${sc._id}`;
    iconContainer.className = "d-inline-flex flex-column align-items-center p-2 shortcut-container";
    let iconIcon;
if(sc.data.iconType === "img") {
    iconIcon = document.createElement("div");
    iconIcon.className = `shortcut-icon`;
    iconIcon.style = "background: url("+JSON.stringify(sc.data.iconTypeData)+") center / contain no-repeat;";
}
if(sc.data.iconType === "icon") {
    iconIcon = document.createElement("i");
    iconIcon.className = `${sc.data.iconTypeData} d-flex justify-content-center shortcut-icon`;
}
const iconText = document.createElement("span");
    iconText.className = "text-center shortcut-text";
    iconText.innerHTML = sc.name;

    iconContainer.appendChild(iconIcon);
    iconContainer.appendChild(iconText);
    
    parent.appendChild(iconContainer);
}