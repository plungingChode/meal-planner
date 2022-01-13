import type { ProjectDefinition, MealBlueprint, FoodNutrients } from '../models';
import type { SubmitErrorHandler } from 'react-hook-form';

import React from 'react';
import { useForm, FormProvider, useFormContext, useFieldArray } from 'react-hook-form';

interface NutrientAttributes {
  unit: string;
  localizedName: string;
}

const nutrients: Record<FoodNutrients, NutrientAttributes> = {
  'energy': {
    unit: 'kcal',
    localizedName: 'energy',
  },
  'carbohydrates': {
    unit: 'g',
    localizedName: 'carbohydrates',
  },
  'protein': {
    unit: 'g',
    localizedName: 'protein',
  },
  'fat': {
    unit: 'g',
    localizedName: 'fat'
  },
};

interface LimitEntryProps {
  idx: number;
  nutrient: FoodNutrients;
}

const limitStrings = {
  max: {
    fieldName: 'max',
    errorMessage: 'Maximum value is not a number'
  },
  min: {
    fieldName: 'min',
    errorMessage: 'Minimum value is not a number'  
  }
};
function LimitEntry(props: LimitEntryProps) {
  const { register, getValues } = useFormContext();
  const { unit } = nutrients[props.nutrient];

  const path = (limit: 'min' | 'max') => (
    `blueprints.${props.idx}.limits.${props.nutrient}.${limit}`
  );

  const minInput = path('min');
  const maxInput = path('max');

  // Passed as min value validator
  const validateAtLeastOneLimit = (value: string, isMin: boolean) => {
    const [currentStrings, otherStrings] = isMin 
      ? [limitStrings.min, limitStrings.max] 
      : [limitStrings.max, limitStrings.min];

    const current = String(value);
    const currentLimits = getValues()['blueprints'][props.idx]['limits'];
    const other = currentLimits[props.nutrient][otherStrings.fieldName];

    // Cannot leave both empty
    if (!(current || other)) {
      return 'Need at least one limit';
    }
    // If the current input is empty, the other must have data
    if (!current) {
      return true;
    }
    
    // Check for a valid number
    const currentValue = Number.parseFloat(current.replace(',', '.'));
    if (Number.isNaN(currentValue)) {
      return currentStrings.errorMessage;
    }
    return true;
  };

  return (
    <>
      <div>
        <span>
          <label htmlFor={minInput}>min value</label>
          <input
            type='text'
            id={minInput}
            placeholder='-inf'
            {...register(minInput, { validate: s => validateAtLeastOneLimit(s, true) })}
          />
          {unit}
        </span>
        <span>
          &lt; {props.nutrient} &lt;
        </span>
        <span>
          <label htmlFor={maxInput}>max value</label>
          <input
            type='text'
            id={maxInput}
            placeholder='-inf'
            {...register(maxInput, { validate: s => validateAtLeastOneLimit(s, false) })}
          />
          {unit}
        </span>
      </div>
    </>
  );
}

interface BlueprintRowProps {
  idx: number;
  onRemoveRow: (idx: number) => void;
  onMoveRowUp: (idx: number) => void;
  onMoveRowDown: (idx: number) => void;
}

function BlueprintRow(props: BlueprintRowProps) {
  const { idx, onMoveRowUp, onMoveRowDown, onRemoveRow } = props;
  const { register } = useFormContext();

  const nameInput = `blueprints.${idx}.name`;

  return (
    <div>
      <input type='button' value='v' onClick={() => onMoveRowDown(idx)} />
      <input type='button' value='^' onClick={() => onMoveRowUp(idx)} />
      <input type='button' value='x' onClick={() => onRemoveRow(idx)} />
      <label htmlFor={nameInput}>meal name</label>
      <input
        type='text'
        id={nameInput}
        {...register(nameInput, { required: true })}
      />
      <LimitEntry idx={props.idx} nutrient='energy' />
      <LimitEntry idx={props.idx} nutrient='carbohydrates' />
      <LimitEntry idx={props.idx} nutrient='protein' />
      <LimitEntry idx={props.idx} nutrient='fat' />
    </div>
  );
}

interface ConfigFormData {
  name: string;
  blueprints: MealBlueprint[];
}

function ConfigForm(defaultValues: ConfigFormData) {
  
}

interface ProjectConfigProps {
  existingProjects: string[];
  defaultValues?: ConfigFormData;
  // onDone: (results: ConfigState) => void;
  // onCancel: () => void;
}

function ProjectConfig(props: ProjectConfigProps) {
  const { defaultValues, existingProjects } = props;
  const formMethods = useForm<ConfigFormData>({ defaultValues });
  const { register, handleSubmit, control, } = formMethods;
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'blueprints'
  });

  // TODO validate
  // https://react-hook-form.com/get-started#applyvalidation
  // TODO assign blueprint order manually before save
  const onValid = (data: any) => console.log(JSON.stringify(data, null, 2));
  const onInvalid: SubmitErrorHandler<ConfigFormData> = (errors) => {
    console.log(errors);
  };

  // Don't create new entry when moving past last index
  const handleMoveDown = (idx: number) => move(idx, Math.min(idx + 1, fields.length - 1));
  const handleMoveUp = (idx: number) => move(idx, idx - 1);
  const handleRemove = (idx: number) => remove(idx);

  const validateProjectName = (name: string) => {
    if(existingProjects.includes(name)) {
      return 'A project with this name already exists.';
    }
    return true;
  };

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(() => { }, onInvalid)}>
        <label htmlFor='pc-projectname'>Project name</label>
        <input
          id='pc-projectname'
          type='text'
          {...register('name', { required: true, validate: validateProjectName })}
        />

        {fields.map((field, idx) => (
          <BlueprintRow
            key={field.id}
            idx={idx}
            onRemoveRow={handleRemove}
            onMoveRowUp={handleMoveUp}
            onMoveRowDown={handleMoveDown}
          />
        ))}
        <input type='button' onClick={() => append({})} value='+meal' />
        <input type='submit' value='Submit' />
      </form>
    </FormProvider>
  );
}

export default ProjectConfig;
