def select_target_column(df):
    target = input("\nEnter the name of the target class column: ").strip() # prompt the user and remove leading/trailing whitespace
    while target not in df.column: # repeat while the entered name is not present in the DataFrame's columns
        print("Invalid input. Column not found.")
        target = input("\nEnter the name of the target class column: ").strip() # prompt again and strip whitespace
    return target