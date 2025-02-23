import { statusCode } from "../config/status.js";
import { productStringRegExp } from "../api/validators/validators.js";

export const itemsSearchMiddleware = (req, res, next) => {
    const { 
        name, 
        category,
        color, 
        isFragile=false
    } = req.query

    if (!isNaN(name) || !isNaN(category) || !isNaN(color)) {
        return next(
            new ErrorResponse(
                'Invalid query parameters',
                'Invalid query parameters: name, category, color must be strings',
                statusCode.badRequestCode
            )
        );
    }
    
    if (!productStringRegExp.test(name) || !productStringRegExp.test(category) || !productStringRegExp.test(color)) { 
        return next(
            new ErrorResponse(
                'Invalid query parameters',
                'Invalid query parameters: name, category, color must match the product string regular expression',
                statusCode.badRequestCode
            )
        );
    }

    if (typeof isFragile !== "boolean") return next(
        new ErrorResponse(
            'Invalid query parameter',
            'Invalid query parameter: isFragile must be a boolean',
            statusCode.badRequestCode
        )
    );

    req.itemsSearch = {
        name: name,
        category: category === undefined ? category : category.toUpperCase(),
        color,
        isFragile
    }

    next();
}
