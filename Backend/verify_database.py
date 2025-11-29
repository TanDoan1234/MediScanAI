#!/usr/bin/env python3
"""
Script kiểm tra database files và verify flow
"""
import pandas as pd
import os
from pathlib import Path

def check_file(filepath, expected_columns):
    """Kiểm tra file CSV"""
    print(f"\n{'='*60}")
    print(f"📁 Checking: {filepath}")
    print(f"{'='*60}")
    
    if not os.path.exists(filepath):
        print(f"❌ File NOT FOUND: {filepath}")
        return False
    
    try:
        df = pd.read_csv(filepath)
        
        print(f"✅ File exists")
        print(f"📊 Total records: {len(df)}")
        print(f"📋 Columns ({len(df.columns)}): {list(df.columns)}")
        
        # Check expected columns
        missing_cols = set(expected_columns) - set(df.columns)
        extra_cols = set(df.columns) - set(expected_columns)
        
        if missing_cols:
            print(f"⚠️  Missing columns: {missing_cols}")
        
        if extra_cols:
            print(f"ℹ️  Extra columns: {extra_cols}")
        
        if set(df.columns) == set(expected_columns):
            print(f"✅ All expected columns present!")
        
        # Show sample data
        print(f"\n📄 Sample data (first 3 rows):")
        print(df.head(3).to_string())
        
        # Check for nulls
        null_counts = df.isnull().sum()
        if null_counts.sum() > 0:
            print(f"\n⚠️  Null values found:")
            print(null_counts[null_counts > 0])
        else:
            print(f"\n✅ No null values")
        
        return True
        
    except Exception as e:
        print(f"❌ Error reading file: {e}")
        return False


def main():
    print("=" * 60)
    print("🔍 MEDISCAN DATABASE VERIFICATION")
    print("=" * 60)
    
    # Define paths
    base_path = Path(__file__).parent.parent / "Crawldata"
    
    files_to_check = {
        "drug_index.csv": ["DrugName", "ActiveIngredient", "PageNumber"],
        "drug_database_refined.csv": ["DrugName", "ActiveIngredient", "PageNumber", "Category", "Is_Prescription"]
    }
    
    results = {}
    
    for filename, expected_cols in files_to_check.items():
        filepath = base_path / filename
        results[filename] = check_file(str(filepath), expected_cols)
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 SUMMARY")
    print("=" * 60)
    
    for filename, success in results.items():
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {filename}")
    
    # Recommendation
    print("\n" + "=" * 60)
    print("💡 RECOMMENDATION")
    print("=" * 60)
    
    if results.get("drug_database_refined.csv"):
        print("✅ USE: drug_database_refined.csv")
        print("   Reason: Contains all required columns:")
        print("   - DrugName")
        print("   - ActiveIngredient")
        print("   - PageNumber")
        print("   - Category (for classification)")
        print("   - Is_Prescription (for safety warnings)")
        
        print("\n📝 Backend Configuration:")
        print("   Update app.py:")
        print("   DRUG_DB_PATH = '../Crawldata/drug_database_refined.csv'")
    else:
        print("⚠️  drug_database_refined.csv not found or has issues")
    
    print("\n" + "=" * 60)
    
    # Compare databases
    if all(results.values()):
        print("\n🔄 COMPARING DATABASES")
        print("=" * 60)
        
        df1 = pd.read_csv(base_path / "drug_index.csv")
        df2 = pd.read_csv(base_path / "drug_database_refined.csv")
        
        print(f"drug_index.csv records: {len(df1)}")
        print(f"drug_database_refined.csv records: {len(df2)}")
        
        if len(df1) == len(df2):
            print("✅ Same number of records")
        else:
            print(f"⚠️  Different record counts: {len(df1)} vs {len(df2)}")
        
        # Check if drug_database_refined has the extra columns
        print(f"\n✅ drug_database_refined.csv has {len(df2.columns) - len(df1.columns)} additional columns:")
        extra_cols = set(df2.columns) - set(df1.columns)
        for col in extra_cols:
            print(f"   - {col}")
            # Show value distribution
            if col == "Is_Prescription":
                print(f"     Distribution: {df2[col].value_counts().to_dict()}")
            elif col == "Category":
                print(f"     Unique categories: {df2[col].nunique()}")


if __name__ == "__main__":
    main()
