-- Add CHECK constraints for numeric fields in containers
ALTER TABLE "containers"
    ADD CONSTRAINT "container_max_capacity_positive"
        CHECK (max_capacity > 0),
    ADD CONSTRAINT "container_max_weight_positive"
        CHECK (max_weight > 0),
    ADD CONSTRAINT "container_empty_weight_non_negative"
        CHECK (empty_weight >= 0);

-- Add CHECK constraint for quantity in container_items
ALTER TABLE "container_items"
    ADD CONSTRAINT "container_items_quantity_positive"
        CHECK (quantity > 0);
