create function trigger_set_timestamp()
returns trigger as $$
begin
    NEW.updated_at = now();
return NEW;
end;
$$ language plpgsql;

-- function that will get the updated_at field to change when a row is updated