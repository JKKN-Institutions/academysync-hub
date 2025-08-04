-- Fix function search path security issue
DROP FUNCTION IF EXISTS public.create_goal_version();

CREATE OR REPLACE FUNCTION public.create_goal_version()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert version record for the OLD values
    INSERT INTO public.goal_versions (
        goal_id,
        version_number,
        area_of_focus,
        smart_goal_text,
        knowledge_what,
        knowledge_how,
        skills_what,
        skills_how,
        action_plan,
        target_date,
        status,
        changed_by,
        change_summary,
        previous_values
    ) VALUES (
        OLD.id,
        OLD.version_number,
        OLD.area_of_focus,
        OLD.smart_goal_text,
        OLD.knowledge_what,
        OLD.knowledge_how,
        OLD.skills_what,
        OLD.skills_how,
        OLD.action_plan,
        OLD.target_date,
        OLD.status,
        NEW.created_by,
        CASE 
            WHEN OLD.status != NEW.status THEN 'Status changed from ' || OLD.status || ' to ' || NEW.status
            ELSE 'Goal updated'
        END,
        row_to_json(OLD)
    );
    
    -- Increment version number
    NEW.version_number = OLD.version_number + 1;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO '';