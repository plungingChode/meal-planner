import { ProjectDefinition, MealBlueprint, FoodNutrients } from '../models';

import React, { useReducer, useState } from 'react';
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
}

interface LimitEntryProps {
  idx: number;
  nutrient: FoodNutrients;
}

function LimitEntry(props: LimitEntryProps) {
  const { register } = useFormContext();
  const { unit } = nutrients[props.nutrient];
  
  const path = (limit: 'min' | 'max') => (
    `blueprints.${props.idx}.limits.${props.nutrient}.${limit}`
  );

  return (
    <>
      <div>
        <span>
          <label htmlFor={path('min')}>min value</label>
          <input 
            type='text' 
            id={path('min')} 
            placeholder='-inf'
            {...register(path('min'))}
          />
          {unit}
        </span>
        <span>
          &lt; {props.nutrient} &lt;
        </span>
        <span>
          <label htmlFor={path('max')}>max value</label>
          <input 
            type='text' 
            id={path('max')} 
            placeholder='-inf'
            {...register(path('max'))}
          />          
          {unit}
        </span>
      </div>
    </>
  )
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
  const path = (name: string) => `blueprints.${idx}.${name}`

  return (
    <div>
      <input type='button' value='v' onClick={() => onMoveRowDown(idx)}/>
      <input type='button' value='^' onClick={() => onMoveRowUp(idx)}/>
      <input type='button' value='x' onClick={() => onRemoveRow(idx)}/>
      <label htmlFor={path('name')}>meal name</label>
      <input
        type='text'
        id={path('name')}
        {...register(path('name'))}
      />
      <LimitEntry idx={props.idx} nutrient='energy' />
      <LimitEntry idx={props.idx} nutrient='carbohydrates' />
      <LimitEntry idx={props.idx} nutrient='protein' />
      <LimitEntry idx={props.idx} nutrient='fat' />
    </div>
  )
}

interface ProjectConfigProps {
  // onDone: (results: ConfigState) => void;
  // onCancel: () => void;
}

function ProjectConfig(props: ProjectConfigProps) {
  const formMethods = useForm();
  const { register, handleSubmit, control } = formMethods;
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'blueprints'
  });

  // TODO validate
  // https://react-hook-form.com/get-started#applyvalidation
  // TODO assign blueprint order manually before save
  const onSubmit = (data: any) => console.log(JSON.stringify(data, null, 2));

  // Don't create new entry when moving past last index
  const handleMoveDown = (idx: number) => move(idx, Math.min(idx + 1, fields.length - 1));
  const handleMoveUp = (idx: number) => move(idx, idx - 1);
  const handleRemove = (idx: number) => remove(idx);

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <label htmlFor='pc-projectname'>Project name</label>
        <input
          id='pc-projectname'
          type='text'
          {...register('name')}
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
        <input type='button' onClick={() => append({ name: '' })} value='+meal' />
        <input type='submit' value='Submit' />
      </form>
    </FormProvider>
  );
}

export default ProjectConfig;
