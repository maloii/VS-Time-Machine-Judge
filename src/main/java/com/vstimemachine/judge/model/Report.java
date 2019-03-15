package com.vstimemachine.judge.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Parameter;
import org.hibernate.annotations.Type;

import javax.persistence.*;
import java.util.Map;

@Data
@Entity
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(of = { "id" })
public class Report {

    @Id
    @GeneratedValue
    private Long id;

    private String name;

    private TypeReport typeReport;

    @Type(
            type = "org.hibernate.type.SerializableToBlobType",
            parameters = { @Parameter( name = "classname", value = "java.util.HashMap" ) }
    )
    private Map<String, String> parametrs;


    @ManyToOne(cascade = CascadeType.PERSIST)
    private Competition competition;
}
