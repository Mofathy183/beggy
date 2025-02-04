// // //*this will add to the database because confirmPassword is boolean
// // export const isPasswordMatch = (password, confirmPassword) => password === confirmPassword



//* this will add to the database because birth is DateTime
export const birthOfDate = (birth) => {
    if (!birth) return undefined;

    return new Date(birth);
}


//* this will add to the database because profile picture has default value 
//* will add if user does not have profile picture
//* means that is value is undefined

export const picture = (body) => body?.profilePicture || undefined
