//*==========================={User Helpers}======================== 

export const addUserGender = (args, query) => {
    if (!args.data.gender) return undefined;

    args.data.gender = args.data.gender.toUpperCase()
    
    return query(args)
}

export const getDisplayName = (firstName, lastName) => {
    if (!firstName || !lastName) return undefined;
    
    const titleFirstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
    const titleLastName = lastName.charAt(0).toUpperCase() + lastName.slice(1);
    
    return `${titleFirstName} ${titleLastName}`;
}

export const getAge = (birth) => {
    if (!birth) return null;
    
    const birthDate = new Date(birth) //* birth already added to the database as new Date
    const currentDate = new Date();
    let age = currentDate.getFullYear() -  birthDate.getFullYear();
    const monthDiff = currentDate.getMonth() - birthDate.getMonth();
    const dayDiff = currentDate.getDate() - birthDate.getDate();
    
    // Adjust age if birth month and day haven't passed yet
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        age--;
    }
    
    return age;
}
//*==========================={User Helpers}======================== 


//*==========================={Account Helpers}======================== 
export const addAccountProvider = (args, query) => {
    if (!args.data.provider) return undefined;

    args.data.provider = args.data.provider.toUpperCase()
    
    return query(args)
}
//*==========================={Account Helpers}======================== 


//*==========================={Suitcases Helpers}========================
export const getCurrentWeight = (items) => {
    if (items.length === 0) return 0;

    
    const currentWeight = items.reduce((acc, item) => {
        return acc + item.weight;;
    }, 0)
    
    return Number(currentWeight).toFixed(2);
};

export const getIsWeightExceeded = (items, maxWeight) => {
    const currentWeight = getCurrentWeight(items);

    if (!currentWeight ||!maxWeight) return false;

    //* if the current weight is greater than the max weight
    //* that means the current weight is exceeded the max weight
    //* so return true, else return false
    return currentWeight > maxWeight; 
};

export const getCurrentCapacity = (items) => {
    if (items.length === 0) return 0;

    
    const currentCapacity = items.reduce((acc, item) => {
        return acc + item.volume;
    }, 0)
    
    return Number(currentCapacity).toFixed(2);
}

export const getIsCapacityExceeded = (items, capacity) => {
    const currentCapacity = getCurrentCapacity(items);

    if (!currentCapacity ||!capacity) return false;

    //* if the current weight is greater than the max weight
    //* that means the current weight is exceeded the max weight
    //* so return true, else return false
    return currentCapacity > capacity; 
}

//*==========================={Suitcases Helpers}======================== 


//*==========================={Items Helpers}======================== 
export const addItemCategory = (args, query) => {
    if (!args.data.category) return undefined;

    args.data.category = args.data.category.toUpperCase();
    return query(args)
}
//*==========================={Items Helpers}========================  